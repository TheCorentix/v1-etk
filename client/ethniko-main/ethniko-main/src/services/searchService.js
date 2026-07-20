import { productService } from './productService';

const simulateLatency = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 300);
  });
};

export const searchService = {
  getTrendingSearches: () => {
    return simulateLatency([
      "Pre-draped Sarees",
      "Zardozi Lehengas",
      "Handloom Sarees",
      "Mens Ivory Sherwani",
      "Anarkali Kurtis",
      "Chanderi Silk"
    ]);
  },

  getPopularProducts: async () => {
    const res = await productService.getProducts({ page: 1, limit: 4 });
    return res.products;
  },

  search: async (query) => {
    const res = await productService.getProducts({ search: query, page: 1, limit: 10 });
    return res.products;
  }
};
