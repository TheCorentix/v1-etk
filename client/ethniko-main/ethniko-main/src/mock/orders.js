// 10 mock customer orders for ETNIKO
export const mockOrders = [
  {
    id: "ord-1",
    customerId: "cust-user-1",
    customerName: "Radhika Sen",
    customerPhone: "+91 98300 12345",
    customerEmail: "radhika.sen@example.com",
    items: [
      {
        productId: "prod-1",
        name: "Indigo Silk Pre-Draped Saree",
        sku: "ETK-WOMEN-SAREES-001",
        size: "M",
        qty: 1,
        price: 14500,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80"
      }
    ],
    subtotal: 14500,
    discount: 1600,
    shipping: 0,
    total: 12900,
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    orderStatus: "Delivered",
    shippingAddress: {
      name: "Radhika Sen",
      phone: "+91 98300 12345",
      addressLine1: "Apt 4B, Silver Oak Residences",
      addressLine2: "Road No. 12, Banjara Hills",
      city: "Hyderabad",
      state: "Telangana",
      postalCode: "500034",
      country: "India"
    },
    trackingNumber: "TRAK-IND-98765",
    createdAt: "2026-06-10T11:00:00.000Z",
    statusHistory: [
      { status: "New", timestamp: "2026-06-10T11:00:00.000Z", note: "Order placed successfully." },
      { status: "Confirmed", timestamp: "2026-06-10T12:30:00.000Z", note: "Boutique manager confirmed inventory." },
      { status: "Packed", timestamp: "2026-06-11T10:00:00.000Z", note: "Gift wrapped in heritage muslin box." },
      { status: "Shipped", timestamp: "2026-06-11T16:00:00.000Z", note: "Handed over to premium courier service." },
      { status: "Delivered", timestamp: "2026-06-13T14:20:00.000Z", note: "Delivered directly to client." }
    ]
  },
  {
    id: "ord-2",
    customerId: "cust-user-1",
    customerName: "Radhika Sen",
    customerPhone: "+91 98300 12345",
    customerEmail: "radhika.sen@example.com",
    items: [
      {
        productId: "prod-3",
        name: "Olive Handloom Tussar Kurta Set",
        sku: "ETK-MEN-KURTAS-003",
        size: "L",
        qty: 1,
        price: 9750,
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80"
      }
    ],
    subtotal: 9750,
    discount: 1250,
    shipping: 0,
    total: 8500,
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    orderStatus: "Shipped",
    shippingAddress: {
      name: "Radhika Sen",
      phone: "+91 98300 12345",
      addressLine1: "Apt 4B, Silver Oak Residences",
      addressLine2: "Road No. 12, Banjara Hills",
      city: "Hyderabad",
      state: "Telangana",
      postalCode: "500034",
      country: "India"
    },
    trackingNumber: "TRAK-IND-11223",
    createdAt: "2026-06-28T09:00:00.000Z",
    statusHistory: [
      { status: "New", timestamp: "2026-06-28T09:00:00.000Z", note: "Order placed." },
      { status: "Confirmed", timestamp: "2026-06-28T11:00:00.000Z", note: "Confirmed by boutique." },
      { status: "Packed", timestamp: "2026-06-29T10:30:00.000Z", note: "Packed." },
      { status: "Shipped", timestamp: "2026-06-30T15:00:00.000Z", note: "Out for shipping via BlueDart." }
    ]
  }
];

// Add 8 more mock orders
const userNames = ["Mira Roy", "Siddharth Malhotra", "Karan Johar", "Sonam Dev", "Nandini Gupta", "Rohan Mehta", "Pooja Hegde", "Arjun Kapoor"];
const paymentMethods = ["razorpay", "cod", "whatsapp"];
const orderStatuses = ["New", "Confirmed", "Packed", "Shipped", "Delivered", "Returned/Cancelled"];

for (let i = 3; i <= 10; i++) {
  const name = userNames[i - 3];
  const prodNum = (i % 5) + 1;
  const price = 6000 + (i * 1200);
  const status = orderStatuses[i % orderStatuses.length];

  mockOrders.push({
    id: `ord-${i}`,
    customerId: `cust-user-${i}`,
    customerName: name,
    customerPhone: `+91 98000 0000${i}`,
    customerEmail: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
    items: [
      {
        productId: `prod-${prodNum}`,
        name: prodNum === 1 ? "Indigo Silk Pre-Draped Saree" : "Luxury Designer Heritage Outfit",
        sku: `ETK-WOMEN-00${prodNum}`,
        size: "L",
        qty: 1,
        price: price,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80"
      }
    ],
    subtotal: price,
    discount: Math.round(price * 0.1),
    shipping: i % 2 === 0 ? 150 : 0,
    total: price - Math.round(price * 0.1) + (i % 2 === 0 ? 150 : 0),
    paymentMethod: paymentMethods[i % paymentMethods.length],
    paymentStatus: i % 3 === 0 ? "pending" : "paid",
    orderStatus: status,
    shippingAddress: {
      name: name,
      phone: `+91 98000 0000${i}`,
      addressLine1: `${12 + i}, Jubilee Hills Landmark`,
      addressLine2: "Road No 5",
      city: "Hyderabad",
      state: "Telangana",
      postalCode: "500033",
      country: "India"
    },
    trackingNumber: status === "Shipped" || status === "Delivered" ? `TRAK-IND-9900${i}` : undefined,
    createdAt: new Date(Date.now() - i * 4 * 24 * 60 * 60 * 1000).toISOString(),
    statusHistory: [
      { status: "New", timestamp: new Date(Date.now() - i * 4 * 24 * 60 * 60 * 1000).toISOString(), note: "Order placed." }
    ]
  });
}
