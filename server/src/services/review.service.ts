import fs from 'fs/promises';
import { ReviewRepository, ReviewDocument, ReviewStatus } from '../repositories/review.repository';
import { OrderRepository, OrderDocument } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { uploadToCloudinary, deleteFromCloudinary, publicIdFromCloudinaryUrl } from '../utils/cloudinary';
import { httpError } from '../utils/httpError';
import { logger } from '../config/logger';

// A customer can review a product once an order containing it has been paid for and delivered.
// (Cancelled orders never count.) Add 'SHIPPED' here to let people review as soon as it ships.
export const REVIEWABLE_ORDER_STATUSES: OrderDocument['orderStatus'][] = ['DELIVERED'];

export type EligibilityReason = 'ALREADY_REVIEWED' | 'NOT_DELIVERED_YET' | 'NOT_PURCHASED';

const REASON_MESSAGES: Record<EligibilityReason, string> = {
  ALREADY_REVIEWED: "You've already reviewed this product.",
  NOT_DELIVERED_YET: 'You can review this product once your order has been delivered.',
  NOT_PURCHASED: 'Only customers who have bought this product can review it.',
};

interface Eligibility {
  canReview: boolean;
  reason?: EligibilityReason;
  review?: { status: ReviewStatus; rating: number }; // the customer's existing review, if any
  orderId?: string; // the delivered order that qualifies (kept internal)
}

/** "Ananya Rao" -> "Ananya R." so the public never sees a full name. */
export const maskName = (fullName: string): string => {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Customer';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
};

/** Average (one decimal), count and a 1-5 star breakdown. */
export const summarizeRatings = (reviews: { rating: number }[]) => {
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  reviews.forEach((review) => {
    total += review.rating;
    distribution[review.rating as 1 | 2 | 3 | 4 | 5] += 1;
  });
  const count = reviews.length;
  return { average: count ? Math.round((total / count) * 10) / 10 : 0, count, distribution };
};

const toPublic = (review: ReviewDocument) => ({
  id: review.id,
  userName: maskName(review.userName),
  rating: review.rating,
  title: review.title || null,
  comment: review.comment,
  images: review.images,
  verifiedPurchase: true, // every review is from a buyer
  createdAt: review.createdAt,
});

export class ReviewService {
  private reviewRepository = new ReviewRepository();
  private orderRepository = new OrderRepository();
  private productRepository = new ProductRepository();

  /** Works out whether a customer may review a product, and why not if they can't. */
  private async assess(userId: string, productId: string): Promise<Eligibility> {
    const existing = await this.reviewRepository.findByUserAndProduct(userId, productId);
    if (existing) {
      return { canReview: false, reason: 'ALREADY_REVIEWED', review: { status: existing.status, rating: existing.rating } };
    }

    const orders = await this.orderRepository.findByUserId(userId);
    const boughtIt = orders.filter(
      (order) =>
        order.paymentStatus === 'paid' &&
        order.orderStatus !== 'CANCELLED' &&
        order.items.some((item) => item.productId === productId)
    );
    const qualifying = boughtIt.find((order) => REVIEWABLE_ORDER_STATUSES.includes(order.orderStatus));

    if (qualifying) return { canReview: true, orderId: qualifying.id };
    return { canReview: false, reason: boughtIt.length > 0 ? 'NOT_DELIVERED_YET' : 'NOT_PURCHASED' };
  }

  /** What the product page needs to decide between the form and a message. */
  async getEligibility(userId: string, productId: string) {
    const { canReview, reason, review } = await this.assess(userId, productId);
    return { canReview, reason, review, message: reason ? REASON_MESSAGES[reason] : null };
  }

  /**
   * Saves a new review as PENDING (it is hidden until an admin approves it).
   * Temporary upload files are always cleaned up.
   */
  async createReview(
    user: { uid: string; name: string },
    input: { productId: string; rating: number; title?: string; comment: string },
    localImagePaths: string[]
  ) {
    const discardUploads = () => Promise.all(localImagePaths.map((path) => fs.unlink(path).catch(() => undefined)));

    let orderId = '';
    let product;
    try {
      product = await this.productRepository.findById(input.productId);
      if (!product) throw httpError(404, 'That product was not found.');

      const verdict = await this.assess(user.uid, input.productId);
      if (!verdict.canReview) {
        throw httpError(verdict.reason === 'ALREADY_REVIEWED' ? 409 : 403, REASON_MESSAGES[verdict.reason as EligibilityReason]);
      }
      orderId = verdict.orderId as string;
    } catch (error) {
      await discardUploads();
      throw error;
    }

    const imageUrls: string[] = [];
    try {
      for (const path of localImagePaths) {
        const uploaded = await uploadToCloudinary(path, 'reviews');
        imageUrls.push(uploaded.secureUrl);
      }
    } catch (error) {
      await discardUploads();
      await this.purgeImages(imageUrls); // don't leave half the photos behind
      throw error;
    }

    const review = await this.reviewRepository.create({
      productId: input.productId,
      productName: product.name,
      productSlug: product.slug,
      userId: user.uid,
      userName: user.name,
      rating: input.rating,
      title: input.title || null,
      comment: input.comment,
      images: imageUrls,
      orderId,
      status: 'PENDING',
    });

    logger.info(`⭐ New review for "${product.name}" from ${user.name} (${review.id}) is awaiting approval.`);
    return review;
  }

  /** Approved reviews of a product (paged) plus the rating summary. Public. */
  async listPublic(productId: string, page: number, limit: number) {
    const approved = await this.reviewRepository.findByProduct(productId, 'APPROVED');
    const totalItems = approved.length;
    const start = (page - 1) * limit;
    return {
      items: approved.slice(start, start + limit).map(toPublic),
      summary: summarizeRatings(approved),
      pagination: { currentPage: page, totalPages: Math.max(1, Math.ceil(totalItems / limit)), totalItems, limit },
    };
  }

  /** Everything for the moderation screen, optionally filtered by status, with counts. */
  async listForAdmin(status?: ReviewStatus) {
    const all = await this.reviewRepository.listAll();
    const counts = {
      PENDING: all.filter((review) => review.status === 'PENDING').length,
      APPROVED: all.filter((review) => review.status === 'APPROVED').length,
      REJECTED: all.filter((review) => review.status === 'REJECTED').length,
      ALL: all.length,
    };
    return { items: status ? all.filter((review) => review.status === status) : all, counts };
  }

  async setStatus(id: string, status: ReviewStatus, moderator: string) {
    const review = await this.reviewRepository.findById(id);
    if (!review) throw httpError(404, 'Review not found.');
    const updated = await this.reviewRepository.update(id, {
      status,
      moderatedBy: moderator,
      moderatedAt: new Date().toISOString(),
    });
    logger.info(`⭐ Review ${id} marked ${status} by ${moderator}`);
    return updated;
  }

  /** Deletes a review and its photos. */
  async deleteReview(id: string): Promise<void> {
    const review = await this.reviewRepository.findById(id);
    if (!review) throw httpError(404, 'Review not found.');
    await this.reviewRepository.delete(id);
    await this.purgeImages(review.images || []);
    logger.info(`⭐ Review ${id} deleted`);
  }

  /** Removes review photos from Cloudinary. Best effort: failures are logged, not thrown. */
  private async purgeImages(urls: string[]): Promise<void> {
    for (const url of urls) {
      try {
        const publicId = publicIdFromCloudinaryUrl(url);
        if (publicId && publicId.startsWith('etniko/reviews/')) await deleteFromCloudinary(publicId);
      } catch (error) {
        logger.warn(`Could not remove review photo ${url}:`, error);
      }
    }
  }
}
