import { ProductRepository, ProductDocument, ProductFilters } from '../repositories/product.repository';
import { slugify } from '../utils/slug';
import { generateSku } from '../utils/sku';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';
import { getPaginationMetadata, PaginationMeta } from '../utils/pagination';
import { logger } from '../config/logger';

export class ProductService {
  private productRepository = new ProductRepository();

  /**
   * Registers a brand new garment product, uploading any local files to Cloudinary.
   */
  async createProduct(
    productData: Omit<ProductDocument, 'slug' | 'sku' | 'images'>,
    localImagePaths: string[]
  ): Promise<ProductDocument> {
    try {
      // 1. Generate unique URL lookup slug
      const slug = slugify(productData.name);
      const existingProduct = await this.productRepository.findBySlug(slug);
      if (existingProduct) {
        throw new Error(`A product with name/slug "${productData.name}" already exists.`);
      }

      // 2. Generate unique SKU identification code
      const nextSequence = await this.productRepository.getNextSequence();
      const sku = generateSku(productData.category, productData.fabric, nextSequence);

      // 3. Upload gallery pictures to Cloudinary products folder
      const imageUrls: string[] = [];
      for (const path of localImagePaths) {
        const uploadResult = await uploadToCloudinary(path, 'products');
        imageUrls.push(uploadResult.secureUrl);
      }

      const newProduct: ProductDocument = {
        ...productData,
        slug,
        sku,
        images: imageUrls,
      };

      const createdProduct = await this.productRepository.create(newProduct);
      logger.info(`👗 Registered new product: ${createdProduct.name} (${createdProduct.sku})`);
      return createdProduct;
    } catch (error) {
      logger.error('Error in ProductService createProduct:', error);
      throw error;
    }
  }

  /**
   * Modifies an existing product, optional file uploads are added directly to the image gallery.
   */
  async updateProduct(
    id: string,
    updateData: Partial<ProductDocument>,
    localImagePaths?: string[]
  ): Promise<ProductDocument | null> {
    try {
      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        throw new Error(`Product with ID ${id} not found.`);
      }

      let imageUrls = [...(existingProduct.images || [])];

      // Handle file uploads if new images are provided
      if (localImagePaths && localImagePaths.length > 0) {
        const newUrls: string[] = [];
        for (const path of localImagePaths) {
          const uploadResult = await uploadToCloudinary(path, 'products');
          newUrls.push(uploadResult.secureUrl);
        }
        imageUrls = [...imageUrls, ...newUrls];
      }

      const updatedFields: Partial<ProductDocument> = {
        ...updateData,
        images: imageUrls,
        ...(updateData.name && { slug: slugify(updateData.name) }),
      };

      const updatedProduct = await this.productRepository.update(id, updatedFields);
      logger.info(`👗 Updated product: ${existingProduct.sku}`);
      return updatedProduct;
    } catch (error) {
      logger.error(`Error in ProductService updateProduct for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Removes a product catalog document and purges its images from Cloudinary.
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      const product = await this.productRepository.findById(id);
      if (!product) {
        throw new Error(`Product with ID ${id} not found.`);
      }

      // Purge assets from Cloudinary (extracting public ID from Cloudinary secure URL)
      for (const url of product.images) {
        const urlParts = url.split('/');
        const fileWithExtension = urlParts[urlParts.length - 1];
        const publicId = `etniko/products/${fileWithExtension.split('.')[0]}`;
        await deleteFromCloudinary(publicId);
      }

      await this.productRepository.delete(id);
      logger.info(`👗 Deleted product catalog: ${product.name} (${product.sku})`);
    } catch (error) {
      logger.error(`Error in ProductService deleteProduct for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fetches a single product record by its Firestore Document ID.
   */
  async getProductById(id: string): Promise<ProductDocument | null> {
    return this.productRepository.findById(id);
  }

  /**
   * Fetches a single product record by its unique URL slug.
   */
  async getProductBySlug(slug: string): Promise<ProductDocument | null> {
    return this.productRepository.findBySlug(slug);
  }

  /**
   * Lists products matching filters with paginated pagination metadata.
   */
  async listProducts(
    filters: ProductFilters,
    page = 1,
    limit = 10
  ): Promise<{ items: ProductDocument[]; pagination: PaginationMeta }> {
    const { items, total } = await this.productRepository.list(filters, { page, limit });
    const pagination = getPaginationMetadata(total, page, limit);
    return { items, pagination };
  }

  /**
   * Increments or decrements sizes stock levels.
   */
  async updateStock(id: string, size: string, quantityToDeduct: number): Promise<ProductDocument | null> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found.`);
    }

    const currentStock = product.sizes[size] || 0;
    if (currentStock < quantityToDeduct) {
      throw new Error(`Insufficient stock for product ${product.name} in size ${size}. Available: ${currentStock}`);
    }

    const updatedSizes = {
      ...product.sizes,
      [size]: currentStock - quantityToDeduct,
    };

    return this.productRepository.update(id, { sizes: updatedSizes });
  }
}

export default ProductService;
