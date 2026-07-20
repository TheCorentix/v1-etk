import api from '../api/api';

const mapProduct = (p) => {
  if (!p) return p;
  // If price is stored in Paise (i.e. usually > 1000 and has variants with Paise prices)
  // Let's divide by 100 to get Rupees
  const price = p.price ? p.price / 100 : 0;
  const discountPrice = p.discountPrice ? p.discountPrice / 100 : null;
  const sizes = p.sizes ? (Array.isArray(p.sizes) ? p.sizes : Object.keys(p.sizes)) : [];
  
  const variants = p.variants ? p.variants.map(v => ({
    ...v,
    price: v.price ? v.price / 100 : 0,
    stock: v.stock || 0
  })) : [];

  return {
    ...p,
    price,
    discountPrice,
    sizes,
    variants
  };
};

export const productService = {
  /**
   * Retrieves products with filters, sorting, and pagination.
   */
  getProducts: async ({
    category,
    subcategory,
    fabric,
    color,
    occasion,
    priceRange,
    sort,
    search,
    page = 1,
    limit = 12,
  }) => {
    const params = {
      page,
      limit,
    };

    if (search) params.search = search;
    if (category && category !== 'ALL') params.category = category;
    if (subcategory && subcategory !== 'ALL') params.subcategory = subcategory;
    if (fabric && fabric !== 'ALL') params.fabric = fabric;
    if (color && color !== 'ALL') params.color = color;
    if (occasion && occasion !== 'ALL') params.occasion = occasion;

    // Convert price boundaries to Paise for backend compatibility
    if (priceRange && Array.isArray(priceRange)) {
      params.minPrice = Math.round(priceRange[0] * 100);
      params.maxPrice = Math.round(priceRange[1] * 100);
    }

    if (sort) {
      params.sort = sort;
    }

    const response = await api.get('/products', { params });
    const rawProducts = response.data.products || [];
    
    // Return standard success response data envelope
    return {
      products: rawProducts.map(mapProduct),
      pagination: {
        currentPage: response.data.pagination?.currentPage || page,
        totalPages: response.data.pagination?.totalPages || 1,
        totalItems: response.data.pagination?.totalItems || 0,
        limit: response.data.pagination?.limit || limit,
      },
    };
  },

  /**
   * Retrieves a single product document by ID.
   */
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return mapProduct(response.data.product);
  },

  /**
   * Retrieves a single product document by URL slug.
   */
  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/slug/${slug}`);
    return mapProduct(response.data.product);
  },

  /**
   * Creates a new product document (Admin only).
   */
  createProduct: async (productData) => {
    let payload = productData;
    let config = {};

    // Auto-coalesce payloads into multipart/form-data when native files are attached
    if (!(productData instanceof FormData)) {
      payload = new FormData();
      Object.keys(productData).forEach((key) => {
        if (key === 'images' && Array.isArray(productData.images)) {
          productData.images.forEach((file) => payload.append('images', file));
        } else if (key === 'sizes' && typeof productData.sizes === 'object') {
          payload.append('sizes', JSON.stringify(productData.sizes));
        } else {
          payload.append(key, productData[key]);
        }
      });
      config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };
    }

    const response = await api.post('/products', payload, config);
    return response.data.product;
  },

  /**
   * Updates an existing product details (Admin only).
   */
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data.product;
  },

  /**
   * Purges a product and its associated Cloudinary files (Admin only).
   */
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.success;
  },

  /**
   * Retrieves all categories publicly.
   */
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data.items || [];
  },

  /**
   * Retrieves all collections publicly.
   */
  getCollections: async () => {
    const response = await api.get('/collections');
    return response.data.items || [];
  },

  /**
   * Retrieves all public store configurations.
   */
  getPublicSettings: async () => {
    const response = await api.get('/settings/public');
    return response.data || {};
  },
};

export default productService;
