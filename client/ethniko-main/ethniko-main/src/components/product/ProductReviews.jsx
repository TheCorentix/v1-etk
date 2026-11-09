import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, ImagePlus, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewService } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';

const MAX_PHOTOS = 3;
const MAX_PHOTO_MB = 5; // matches the server's limit

const emptySummary = { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

const inputClass = (hasError) =>
  `w-full bg-white border px-3 py-2 text-xs font-sans text-neutral-800 focus:outline-none focus:border-[#B68D40] ${
    hasError ? 'border-red-500' : 'border-neutral-300'
  }`;

function Stars({ value, size = 'w-3 h-3' }) {
  return (
    <span className="flex text-[#B68D40]" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${size} ${i < value ? 'fill-[#B68D40]' : 'opacity-25'}`} />
      ))}
    </span>
  );
}

/**
 * The Reviews tab of a product page: the rating summary, published reviews, and, for customers who
 * have bought and received the product, a form to write one. New reviews wait for admin approval.
 */
export default function ProductReviews({ productId, initial }) {
  const { user } = useAuth();
  const [items, setItems] = useState(initial?.items || []);
  const [summary, setSummary] = useState(initial?.summary || emptySummary);
  const [pagination, setPagination] = useState(initial?.pagination || null);
  const [loadingMore, setLoadingMore] = useState(false);

  // The page loads reviews in the background; pick them up if they arrive after this tab opened
  useEffect(() => {
    setItems(initial?.items || []);
    setSummary(initial?.summary || emptySummary);
    setPagination(initial?.pagination || null);
  }, [initial]);

  // Can this customer review the product?
  const [eligibility, setEligibility] = useState(null);
  useEffect(() => {
    setEligibility(null);
    if (!user) return undefined;
    let cancelled = false;
    reviewService
      .getEligibility(productId)
      .then((result) => { if (!cancelled) setEligibility(result); })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setEligibility({ canReview: false, message: null });
      });
    return () => { cancelled = true; };
  }, [user, productId]);

  // ---- the form
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [justSent, setJustSent] = useState(false);

  const previews = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const addPhotos = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    const valid = picked.filter((file) => {
      if (!file.type.startsWith('image/')) { toast.error(`${file.name} is not an image.`); return false; }
      if (file.size > MAX_PHOTO_MB * 1024 * 1024) { toast.error(`${file.name} is larger than ${MAX_PHOTO_MB} MB.`); return false; }
      return true;
    });
    setPhotos((prev) => {
      const combined = [...prev, ...valid];
      if (combined.length > MAX_PHOTOS) toast.error(`You can add up to ${MAX_PHOTOS} photos.`);
      return combined.slice(0, MAX_PHOTOS);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (rating < 1) found.rating = 'Please choose a star rating.';
    if (comment.trim().length < 10) found.comment = 'Please write at least 10 characters.';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await reviewService.submitReview({ productId, rating, title: title.trim(), comment: comment.trim(), images: photos });
      setJustSent(true);
      setOpen(false);
      setEligibility({ canReview: false, reason: 'ALREADY_REVIEWED', review: { status: 'PENDING', rating } });
    } catch (err) {
      console.error(err);
      toast.error(err?.errors?.[0]?.message || err?.message || 'Could not send your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const loadMore = async () => {
    if (!pagination || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await reviewService.getProductReviews(productId, pagination.currentPage + 1, pagination.limit);
      setItems((prev) => [...prev, ...next.items]);
      setPagination(next.pagination);
    } catch (err) {
      console.error(err);
      toast.error('Could not load more reviews.');
    } finally {
      setLoadingMore(false);
    }
  };

  const hasMore = pagination && pagination.currentPage < pagination.totalPages;
  const shownStars = hoverRating || rating;

  // What to show in the "write a review" area
  const reviewStatusNote = {
    PENDING: 'Thank you! Your review is waiting for our team to approve it.',
    APPROVED: 'Your review is published. Thank you for sharing it!',
    REJECTED: "Your review wasn't approved for publication.",
  };

  let writeArea;
  if (!user) {
    writeArea = (
      <p className="text-neutral-500">
        Bought this piece? <Link to="/profile" className="font-bold text-[#B68D40] underline">Sign in</Link> to write a review.
      </p>
    );
  } else if (!eligibility) {
    writeArea = <p className="text-neutral-400 italic">Checking whether you can review this product…</p>;
  } else if (justSent) {
    writeArea = <p className="text-[#3E7C59] font-semibold">Thank you! Your review will appear once our team has approved it.</p>;
  } else if (eligibility.canReview && !open) {
    writeArea = (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 bg-neutral-900 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#B68D40] transition-colors"
      >
        Write a review
      </button>
    );
  } else if (eligibility.canReview && open) {
    writeArea = (
      <form onSubmit={handleSubmit} noValidate className="space-y-4 bg-white border border-[#E6DCCF] p-5">
        <div className="space-y-1">
          <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">Your rating <span className="text-[#B68D40]">*</span></span>
          <div role="radiogroup" aria-label="Your rating" className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
                onClick={() => { setRating(star); setErrors((prev) => ({ ...prev, rating: undefined })); }}
                onMouseEnter={() => setHoverRating(star)}
                className="p-0.5 focus:outline-none"
              >
                <Star className={`w-6 h-6 transition-colors ${star <= shownStars ? 'fill-[#B68D40] text-[#B68D40]' : 'text-neutral-300'}`} />
              </button>
            ))}
          </div>
          {errors.rating && <p className="text-[10px] text-red-500">{errors.rating}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-wider text-neutral-400 block">Title <span className="normal-case">(optional)</span></label>
          <input type="text" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} placeholder="Sum it up in a few words" className={inputClass(false)} />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-wider text-neutral-400 block">Your review <span className="text-[#B68D40]">*</span></label>
          <textarea
            rows={4}
            value={comment}
            maxLength={2000}
            onChange={(e) => { setComment(e.target.value); setErrors((prev) => ({ ...prev, comment: undefined })); }}
            placeholder="How were the fabric, fit and finish? Would you recommend it?"
            className={inputClass(errors.comment)}
          />
          {errors.comment && <p className="text-[10px] text-red-500">{errors.comment}</p>}
        </div>

        <div className="space-y-2">
          <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">Photos <span className="normal-case">(optional, up to {MAX_PHOTOS})</span></span>
          <div className="flex flex-wrap gap-2">
            {previews.map((src, index) => (
              <div key={src} className="relative w-16 h-20 border border-neutral-200">
                <img src={src} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#B68D40]"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <label className="w-16 h-20 border border-dashed border-neutral-300 flex flex-col items-center justify-center text-neutral-400 hover:text-[#B68D40] hover:border-[#B68D40] cursor-pointer">
                <ImagePlus className="w-4 h-4" />
                <span className="text-[7px] uppercase font-bold pt-1">Add</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={addPhotos} />
              </label>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-neutral-900 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#B68D40] disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Sending…' : 'Submit review'}
          </button>
          <button type="button" onClick={() => setOpen(false)} disabled={submitting} className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 hover:text-black">
            Cancel
          </button>
        </div>
        <p className="text-[10px] text-neutral-400">Your review will be published after our team has approved it.</p>
      </form>
    );
  } else if (eligibility.reason === 'ALREADY_REVIEWED') {
    writeArea = <p className="text-neutral-600">{reviewStatusNote[eligibility.review?.status] || eligibility.message}</p>;
  } else {
    writeArea = <p className="text-neutral-500">{eligibility.message || 'Only customers who have bought this product can review it.'}</p>;
  }

  return (
    <div className="space-y-6 text-xs font-sans">
      {/* Summary */}
      {summary.count > 0 && (
        <div className="flex flex-wrap items-center gap-6 pb-4 border-b border-[#ECECEC]">
          <div className="text-center">
            <div className="font-serif text-4xl text-neutral-900 leading-none">{summary.average.toFixed(1)}</div>
            <div className="flex justify-center pt-1.5"><Stars value={Math.round(summary.average)} /></div>
            <div className="text-[10px] text-neutral-400 pt-1">{summary.count} review{summary.count === 1 ? '' : 's'}</div>
          </div>
          <div className="flex-1 min-w-[160px] space-y-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2 text-[10px] text-neutral-500">
                <span className="w-3 text-right">{star}</span>
                <Star className="w-2.5 h-2.5 text-[#B68D40]" />
                <div className="flex-1 h-1.5 bg-[#E6DCCF]">
                  <div className="h-full bg-[#B68D40]" style={{ width: `${(summary.distribution[star] / summary.count) * 100}%` }} />
                </div>
                <span className="w-5 text-neutral-400">{summary.distribution[star]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write a review (only shown to people who can) */}
      <div>{writeArea}</div>

      {/* Published reviews */}
      <div className="space-y-5">
        {items.length === 0 ? (
          <p className="text-neutral-400 italic">No reviews yet. Reviews from customers who have received this piece will appear here.</p>
        ) : (
          items.map((review) => (
            <div key={review.id} className="border-b border-[#ECECEC] pb-4 space-y-1.5">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-800">{review.userName}</span>
                  <span className="flex items-center gap-0.5 text-[9px] text-[#3E7C59]"><BadgeCheck className="w-3 h-3" /> Verified purchase</span>
                </div>
                <span className="text-[9px] text-neutral-400">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <Stars value={review.rating} />
              {review.title && <p className="font-semibold text-neutral-800">{review.title}</p>}
              <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
              {review.images?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {review.images.map((src) => (
                    <a key={src} href={src} target="_blank" rel="noreferrer">
                      <img src={src} alt="Customer photo" className="w-16 h-20 object-cover border border-[#E6DCCF] hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        {hasMore && (
          <button type="button" onClick={loadMore} disabled={loadingMore} className="text-[10px] uppercase tracking-widest font-bold text-[#B68D40] hover:text-black">
            {loadingMore ? 'Loading…' : 'Show more reviews'}
          </button>
        )}
      </div>
    </div>
  );
}
