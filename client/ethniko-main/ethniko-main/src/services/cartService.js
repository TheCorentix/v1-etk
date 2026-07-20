const simulateLatency = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 400);
  });
};

export const cartService = {
  validateCoupon: (code) => {
    const formatted = code.trim().toUpperCase();
    if (formatted === "ETNIKO10") {
      return simulateLatency({
        valid: true,
        discountPercent: 10,
        description: "10% off on your luxury order"
      });
    }
    if (formatted === "FESTIVE15") {
      return simulateLatency({
        valid: true,
        discountPercent: 15,
        description: "15% off on our Festive Collection"
      });
    }
    return simulateLatency({
      valid: false,
      discountPercent: 0,
      description: "Invalid or expired coupon code"
    });
  },

  estimateShipping: (postalCode) => {
    const isExpress = postalCode.startsWith("500") || postalCode.startsWith("110") || postalCode.startsWith("400");
    return simulateLatency({
      cost: 0, // Free shipping for all premium clients
      deliveryDays: isExpress ? "2-3 business days" : "4-6 business days",
      message: isExpress ? "Premium Express Courier Available" : "Standard Premium Courier Available"
    });
  }
};
