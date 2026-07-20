// 10 mock customization styling requests for ETNIKO
export const mockCustomizations = [
  {
    id: "cust-1",
    customerName: "Aishwarya Rai",
    phone: "+91 98765 43210",
    email: "aishwarya@example.com",
    productId: "prod-1",
    productName: "Indigo Silk Pre-Draped Saree",
    productSku: "ETK-WOMEN-SAREES-001",
    productImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80",
    measurements: {
      bust: "34 inches",
      waist: "28 inches",
      hips: "38 inches",
      height: "5 ft 6 in",
      shoulder: "14 inches",
      custom: "Adjust pre-draped waist hooks to accommodate slightly higher waistline drape."
    },
    specialRequests: "Please add minor silver piping along the edges of the blouse cuffs.",
    referenceImageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&q=80",
    status: "Confirmed",
    notes: [
      { author: "Boutique Stylist", text: "Verified measurements. Client requested high waist rise.", timestamp: "2026-06-20T10:00:00.000Z" },
      { author: "Lead Tailor", text: "Pattern customized, ready for fabric cutting.", timestamp: "2026-06-21T14:30:00.000Z" }
    ],
    createdAt: "2026-06-19T09:30:00.000Z"
  },
  {
    id: "cust-2",
    customerName: "Kareena Kapoor",
    phone: "+91 99999 88888",
    email: "kareena@example.com",
    productId: "prod-2",
    productName: "Terracotta Zardozi Silk Lehenga",
    productSku: "ETK-WOMEN-LEHENGAS-002",
    productImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80",
    measurements: {
      bust: "36 inches",
      waist: "30 inches",
      hips: "40 inches",
      height: "5 ft 5 in",
      shoulder: "15 inches",
      custom: " Lehenga skirt length should be exactly 41 inches."
    },
    specialRequests: "Add heavier tassels to the dupatta corners and increase blouse length by 1 inch.",
    referenceImageUrl: "",
    status: "In Production",
    notes: [
      { author: "Stylist Niharika", text: "Spoke with client on phone. Agreed on gold metallic tassels.", timestamp: "2026-06-18T11:00:00.000Z" }
    ],
    createdAt: "2026-06-17T15:20:00.000Z"
  },
  {
    id: "cust-3",
    customerName: "Deepika Padukone",
    phone: "+91 98888 77777",
    email: "deepika@example.com",
    productId: "prod-5",
    productName: "Mehendi Green Kanjeevaram Saree",
    productSku: "ETK-WOMEN-SAREES-005",
    productImage: "https://images.unsplash.com/photo-1610030470298-4c5855797ee3?auto=format&fit=crop&w=300&q=80",
    measurements: {
      bust: "34 inches",
      waist: "27 inches",
      hips: "37 inches",
      height: "5 ft 8 in",
      shoulder: "14.5 inches",
      custom: "Blouse neck depth: Front 7 inches, Back 9 inches."
    },
    specialRequests: "Dori with gold beads at the back of the blouse.",
    referenceImageUrl: "",
    status: "New",
    notes: [],
    createdAt: "2026-06-30T10:00:00.000Z"
  }
];

// Add 7 more mock customization requests to make it 10
const statuses = ["New", "In Discussion", "Confirmed", "In Production", "Ready", "Delivered"];
const names = ["Alia Bhatt", "Sara Ali Khan", "Janhvi Kapoor", "Kiara Advani", "Katrina Kaif", "Priyanka Chopra", "Sonam Kapoor"];

for (let i = 4; i <= 10; i++) {
  const name = names[i - 4];
  const prodNum = (i % 5) + 1;
  const status = statuses[i % statuses.length];

  mockCustomizations.push({
    id: `cust-${i}`,
    customerName: name,
    phone: `+91 98711 0000${i}`,
    email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
    productId: `prod-${prodNum}`,
    productName: prodNum === 1 ? "Indigo Silk Pre-Draped Saree" : "Luxury Designer Heritage Wear",
    productSku: `ETK-WOMEN-00${prodNum}`,
    productImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80",
    measurements: {
      bust: `${32 + (i % 4)} inches`,
      waist: `${26 + (i % 4)} inches`,
      hips: `${36 + (i % 4)} inches`,
      height: "5 ft 6 in",
      shoulder: "14 inches",
      custom: "Standard luxury custom comfort stitching."
    },
    specialRequests: "Ensure double lining in the sleeves.",
    referenceImageUrl: "",
    status,
    notes: [
      { author: "Boutique Stylist", text: "Order created. High luxury styling scheduled.", timestamp: "2026-06-25T11:00:00.000Z" }
    ],
    createdAt: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString()
  });
}
