import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ProductController {
  private productService = new ProductService();

  /**
   * Creates a new product catalog item (Admin only).
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        name,
        category,
        subcategory,
        price,
        discountPrice,
        description,
        story,
        fabric,
        colors,
        sizes,
        type,
        status,
        care,
      } = req.body;

      // Extract local files paths populated by Multer
      const files = req.files as Express.Multer.File[] || [];
      const localImagePaths = files.map((file) => file.path);

      // Parse JSON fields sent as strings from multipart/form-data
      const parsedPrice = typeof price === 'string' ? parseInt(price, 10) : price;
      const parsedDiscountPrice = discountPrice ? (typeof discountPrice === 'string' ? parseInt(discountPrice, 10) : discountPrice) : null;
      const parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
      const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;

      const product = await this.productService.createProduct(
        {
          name,
          category,
          subcategory,
          price: parsedPrice,
          discountPrice: parsedDiscountPrice,
          description,
          story: story || null,
          fabric,
          colors: parsedColors || [],
          sizes: parsedSizes || {},
          type,
          status: status || 'DRAFT',
          care: care || null,
        },
        localImagePaths
      );

      sendSuccess(res, { product }, 'Product registered successfully.', 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Updates an existing product catalog item (Admin only).
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const {
        name,
        category,
        subcategory,
        price,
        discountPrice,
        description,
        story,
        fabric,
        colors,
        sizes,
        type,
        status,
        care,
      } = req.body;

      const files = req.files as Express.Multer.File[] || [];
      const localImagePaths = files.map((file) => file.path);

      // Coerce field values
      const parsedFields: any = {};
      if (name) parsedFields.name = name;
      if (category) parsedFields.category = category;
      if (subcategory) parsedFields.subcategory = subcategory;
      if (price !== undefined) parsedFields.price = typeof price === 'string' ? parseInt(price, 10) : price;
      if (discountPrice !== undefined) parsedFields.discountPrice = discountPrice ? (typeof discountPrice === 'string' ? parseInt(discountPrice, 10) : discountPrice) : null;
      if (description) parsedFields.description = description;
      if (story !== undefined) parsedFields.story = story || null;
      if (fabric) parsedFields.fabric = fabric;
      if (colors) parsedFields.colors = typeof colors === 'string' ? JSON.parse(colors) : colors;
      if (sizes) parsedFields.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      if (type) parsedFields.type = type;
      if (status) parsedFields.status = status;
      if (care !== undefined) parsedFields.care = care || null;

      const product = await this.productService.updateProduct(id, parsedFields, localImagePaths);
      sendSuccess(res, { product }, 'Product updated successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deletes a product catalog item (Admin only).
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      await this.productService.deleteProduct(id);
      sendSuccess(res, {}, 'Product deleted successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Fetches a single product record by its Firestore Document ID.
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const product = await this.productService.getProductById(id);
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found', errors: ['Not Found'] });
        return;
      }
      sendSuccess(res, { product }, 'Product retrieved successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Fetches a single product record by its unique URL slug.
   */
  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params as { slug: string };
      const product = await this.productService.getProductBySlug(slug);
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found', errors: ['Not Found'] });
        return;
      }
      sendSuccess(res, { product }, 'Product retrieved successfully.', 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lists products matching filters with paginated pagination metadata.
   */
  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        page,
        limit,
        category,
        subcategory,
        type,
        status,
        priceRange,
        search,
      } = req.query;

      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 10;

      // Enforce status filter security: non-admins can only see PUBLISHED products
      const isAdmin = req.user && req.user.role === 'ADMIN';
      const resolvedStatus = isAdmin ? (status as any) : 'PUBLISHED';

      const filters: any = {
        ...(category && { category }),
        ...(subcategory && { subcategory }),
        ...(type && { type }),
        ...(priceRange && { priceRange }),
        ...(search && { search }),
        status: resolvedStatus,
      };

      const result = await this.productService.listProducts(filters, pageNum, limitNum);
      sendSuccess(res, result, 'Products catalog retrieved successfully.', 200);
    } catch (error) {
      next(error);
    }
  };
}

export default ProductController;
