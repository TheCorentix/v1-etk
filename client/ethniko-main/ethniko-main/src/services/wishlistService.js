// Promise-based mock service for Wishlist operations with artificial latency
const simulateLatency = (data, failRate = 0) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < failRate) {
        reject(new Error("Network error. Please try again."));
      } else {
        resolve(data);
      }
    }, 450);
  });
};

export const wishlistService = {
  // Retrieve wishlist from LocalStorage
  getWishlist: () => {
    const saved = localStorage.getItem('etniko_wishlist');
    const items = saved ? JSON.parse(saved) : [];
    return simulateLatency(items);
  },

  // Save product to wishlist in LocalStorage
  addToWishlist: (product) => {
    const saved = localStorage.getItem('etniko_wishlist');
    const items = saved ? JSON.parse(saved) : [];
    if (!items.some(item => item.id === product.id)) {
      items.push(product);
      localStorage.setItem('etniko_wishlist', JSON.stringify(items));
    }
    return simulateLatency(items);
  },

  // Remove product from wishlist in LocalStorage
  removeFromWishlist: (productId) => {
    const saved = localStorage.getItem('etniko_wishlist');
    let items = saved ? JSON.parse(saved) : [];
    items = items.filter(item => item.id !== productId);
    localStorage.setItem('etniko_wishlist', JSON.stringify(items));
    return simulateLatency(items);
  },

  // Clear all items in wishlist
  clearWishlist: () => {
    localStorage.removeItem('etniko_wishlist');
    return simulateLatency([]);
  }
};
