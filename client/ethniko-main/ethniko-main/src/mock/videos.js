// 20 Look & Shop shoppable reels videos for ETNIKO
export const mockVideos = [];

const sampleVideos = [
  "https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-in-traditional-indian-dress-41314-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-young-woman-modelling-indian-traditional-clothing-41317-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-indian-woman-posing-with-traditional-handloom-saree-41316-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-young-man-wearing-traditional-indian-clothes-modeling-41320-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-woman-in-anarkali-suit-modeling-in-studio-41315-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-cute-little-girl-spinning-in-traditional-attire-41321-large.mp4"
];

for (let i = 1; i <= 20; i++) {
  // We associate videos with prod-1 to prod-20
  const prodId = `prod-${(i % 10) + 1}`;
  const videoUrl = sampleVideos[i % sampleVideos.length];

  mockVideos.push({
    id: `las-${i}`,
    videoUrl,
    productId: prodId,
    productSlug: prodId === "prod-1" ? "indigo-silk-pre-draped-saree" : 
                 (prodId === "prod-2" ? "terracotta-zardozi-silk-lehenga" : 
                 (prodId === "prod-3" ? "olive-handloom-tussar-kurta-set" : 
                 (prodId === "prod-4" ? "dusty-rose-gota-patti-anarkali" : 
                 (prodId === "prod-5" ? "mehendi-green-kanjeevaram-silk-saree" : 
                 (prodId === "prod-6" ? "blossom-silk-kid-lehenga-frock" : `women-sarees-${prodId}`))))),
    productName: prodId === "prod-1" ? "Indigo Silk Pre-Draped Saree" : 
                 (prodId === "prod-2" ? "Terracotta Zardozi Silk Lehenga" : 
                 (prodId === "prod-3" ? "Olive Handloom Tussar Kurta Set" : 
                 (prodId === "prod-4" ? "Dusty Rose Gota Patti Anarkali" : 
                 (prodId === "prod-5" ? "Mehendi Green Kanjeevaram Saree" : 
                 (prodId === "prod-6" ? "Blossom Silk Kid Lehenga Frock" : "Premium Silk Collection"))))),
    productPrice: prodId === "prod-1" ? 14500 : 
                  (prodId === "prod-2" ? 28500 : 
                  (prodId === "prod-3" ? 9750 : 
                  (prodId === "prod-4" ? 18500 : 
                  (prodId === "prod-5" ? 24500 : 
                  (prodId === "prod-6" ? 8200 : 16500))))),
    order: i,
    isActive: true,
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
  });
}
