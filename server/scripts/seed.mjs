// One-time seed script for real Firestore.
// Usage (from the server/ folder):  node scripts/seed.mjs
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import path from 'path';

const svcPath = path.resolve(process.cwd(), 'credentials/firebase-service-account.json');
const svc = JSON.parse(readFileSync(svcPath, 'utf8'));

initializeApp({
  credential: cert(svc),
  projectId: svc.project_id,
});
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });
const auth = getAuth();

const now = new Date().toISOString();

const IMG = {
  saree: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
  anarkali: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80',
  lehenga: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
  kurta: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
};

// Build a { size: stock } inventory map from a list of size labels.
const sizeMap = (sizes, per) => sizes.reduce((acc, s) => { acc[s] = per; return acc; }, {});

const PRODUCTS = [
  { id: 'prod-1', name: 'Blush Rose Organza Saree', sku: 'WOM-ORG-0001', category: 'WOMEN', subcategory: 'Sarees', price: 1850000, fabric: 'Organza Silk', colors: ['Gold'], stock: 5, sizes: sizeMap(['XS','S','M','L','XL'], 1), images: [IMG.saree, IMG.lehenga], description: 'Intricately embroidered blush rose organza saree with hand-turned scalloped gota edges.', story: 'Crafted by hand in Lucknow over 3 weeks.', occasion: 'Bridal & Wedding' },
  { id: 'prod-2', name: 'Mustard Silk Anarkali', sku: 'WOM-CHA-0002', category: 'WOMEN', subcategory: 'Anarkalis', price: 1650000, fabric: 'Chanderi Silk', colors: ['Warm Mustard'], stock: 4, sizes: sizeMap(['S','M','L'], 2), images: [IMG.anarkali, IMG.saree], description: 'Mustard yellow traditional pleated Chanderi Anarkali with subtle gold block prints.', story: 'Traditional Chanderi weave.', occasion: 'Festive & Pujas' },
  { id: 'prod-3', name: 'Teal Zardozi Lehenga', sku: 'WOM-RAW-0003', category: 'WOMEN', subcategory: 'Lehengas', price: 3680000, fabric: 'Raw Silk', colors: ['Royal Blue'], stock: 2, sizes: sizeMap(['S','M','L'], 1), images: [IMG.lehenga, IMG.anarkali], description: 'Stunning teal blue raw silk lehenga features detailed gold zardozi leaf work.', story: 'Zardozi hand-crafted embellishment.', occasion: 'Sangeet & Cocktails' },
  { id: 'prod-4', name: 'Beige Threadwork Kurta', sku: 'MEN-TUS-0004', category: 'MEN', subcategory: 'Kurtas', price: 6450000, fabric: 'Tussar Silk', colors: ['Ivory'], stock: 8, sizes: sizeMap(['M','L','XL'], 3), images: [IMG.kurta, IMG.saree], description: 'Classic self-thread embroidered kurta in premium beige handloom silk.', story: 'Tussar handloom silk.', occasion: 'Festive & Pujas' },
  { id: 'prod-5', name: 'Ivory Kanjivaram Silk Saree', sku: 'WOM-KAN-0005', category: 'WOMEN', subcategory: 'Sarees', price: 2450000, fabric: 'Handloom Kanjivaram Silk', colors: ['Ivory','Gold'], stock: 3, sizes: sizeMap(['Free Size'], 3), images: [IMG.saree, IMG.anarkali], description: 'Pure Kanjivaram silk saree in ivory with a traditional temple-border gold zari weave.', story: 'Woven on pit-looms in Kanchipuram.', occasion: 'Bridal & Wedding' },
  { id: 'prod-6', name: 'Crimson Velvet Bridal Lehenga', sku: 'WOM-VEL-0006', category: 'WOMEN', subcategory: 'Lehengas', price: 8900000, discountPrice: 7550000, fabric: 'Silk Velvet', colors: ['Crimson Red'], stock: 2, sizes: sizeMap(['S','M','L','XL'], 1), images: [IMG.lehenga, IMG.saree], description: 'Regal crimson velvet bridal lehenga with dense zardozi and sequin hand-embroidery.', story: 'Over 200 hours of hand embellishment.', occasion: 'Bridal & Wedding' },
  { id: 'prod-7', name: 'Emerald Floor-Length Anarkali', sku: 'WOM-GEO-0007', category: 'WOMEN', subcategory: 'Anarkalis', price: 2150000, fabric: 'Georgette', colors: ['Emerald Green'], stock: 6, sizes: sizeMap(['XS','S','M','L'], 2), images: [IMG.anarkali, IMG.lehenga], description: 'Flowing emerald green floor-length Anarkali with a gota-patti neckline and dupatta.', story: 'Inspired by Mughal court silhouettes.', occasion: 'Festive & Pujas' },
  { id: 'prod-8', name: 'Champagne Draped Indo-Western Gown', sku: 'WOM-CRE-0008', category: 'WOMEN', subcategory: 'Indo-Western', price: 3250000, fabric: 'Crepe & Shimmer', colors: ['Champagne Gold'], stock: 4, sizes: sizeMap(['S','M','L'], 2), images: [IMG.saree, IMG.kurta], description: 'Contemporary champagne pre-draped gown with a structured cape and cowl drape.', story: 'A modern take on the classic saree-gown.', occasion: 'Sangeet & Cocktails' },
  { id: 'prod-9', name: 'Powder Blue Party Frock', sku: 'WOM-NET-0009', category: 'WOMEN', subcategory: 'Frocks', price: 1250000, fabric: 'Net & Satin', colors: ['Powder Blue'], stock: 7, sizes: sizeMap(['XS','S','M','L'], 2), images: [IMG.anarkali, IMG.saree], description: 'Flared powder blue party frock with layered net and delicate pearl detailing.', story: 'Light, twirl-ready festive wear.', occasion: 'Festive & Pujas' },
  { id: 'prod-10', name: 'Ivory Brocade Wedding Sherwani', sku: 'MEN-BRO-0010', category: 'MEN', subcategory: 'Sherwanis', price: 7200000, discountPrice: 6480000, fabric: 'Banarasi Brocade', colors: ['Ivory'], stock: 3, sizes: sizeMap(['38','40','42','44'], 1), images: [IMG.kurta, IMG.lehenga], description: 'Regal ivory Banarasi brocade sherwani with a matching stole and self-woven motifs.', story: 'Handwoven Banarasi brocade.', occasion: 'Bridal & Wedding' },
  { id: 'prod-11', name: 'Cream Silk Dhoti Kurta Set', sku: 'MEN-SIL-0011', category: 'MEN', subcategory: 'Dhotis', price: 2850000, fabric: 'Handloom Silk', colors: ['Cream'], stock: 5, sizes: sizeMap(['M','L','XL'], 2), images: [IMG.kurta, IMG.anarkali], description: 'Elegant cream silk dhoti paired with a short kurta and zari-bordered angavastram.', story: 'Traditional South-Indian handloom.', occasion: 'Festive & Pujas' },
  { id: 'prod-12', name: 'Midnight Blue Linen Kurta', sku: 'MEN-LIN-0012', category: 'MEN', subcategory: 'Kurtas', price: 990000, fabric: 'Pure Linen', colors: ['Midnight Blue'], stock: 10, sizes: sizeMap(['S','M','L','XL','XXL'], 2), images: [IMG.kurta, IMG.saree], description: 'Breathable midnight blue linen kurta with a minimal wooden-button placket.', story: 'Everyday understated elegance.', occasion: 'Daywear & Casual' },
  { id: 'prod-13', name: 'Peach Lehenga Frock (Girls)', sku: 'KID-GIR-0013', category: 'KIDS', subcategory: 'Girls', price: 1450000, fabric: 'Cotton Silk', colors: ['Peach'], stock: 6, sizes: sizeMap(['2-3Y','4-5Y','6-7Y','8-9Y'], 2), images: [IMG.anarkali, IMG.lehenga], description: 'Adorable peach lehenga-frock for girls with sequin florals and a soft cancan lining.', story: 'Comfort-first festive wear for little ones.', occasion: 'Festive & Pujas' },
  { id: 'prod-14', name: 'Maroon Brocade Boys Sherwani', sku: 'KID-BOY-0014', category: 'KIDS', subcategory: 'Boys', price: 1850000, fabric: 'Brocade', colors: ['Maroon'], stock: 4, sizes: sizeMap(['2-3Y','4-5Y','6-7Y','8-9Y'], 1), images: [IMG.kurta, IMG.lehenga], description: 'Dapper maroon brocade sherwani set for boys with a matching kurta and churidar.', story: 'Little groom-ready ensemble.', occasion: 'Bridal & Wedding' },
];

const ADMIN_EMAIL = 'admin@etniko.studio';
const ADMIN_PASSWORD = 'Admin@12345';

async function main() {
  // 1) Seed products
  const batch = db.batch();
  for (const p of PRODUCTS) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    batch.set(db.collection('products').doc(p.id), {
      ...p,
      slug,
      type: 'READY_TO_WEAR',
      status: 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
    });
  }
  await batch.commit();
  console.log(`✅ Seeded ${PRODUCTS.length} products into Firestore.`);

  // 2) Ensure an admin Firebase Auth user + Firestore profile with ADMIN role
  let user;
  try {
    user = await auth.getUserByEmail(ADMIN_EMAIL);
    console.log(`ℹ️  Admin auth user already exists: ${ADMIN_EMAIL}`);
  } catch {
    user = await auth.createUser({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, displayName: 'ETNIKO Admin' });
    console.log(`✅ Created admin auth user: ${ADMIN_EMAIL} (password: ${ADMIN_PASSWORD})`);
  }
  await db.collection('users').doc(user.uid).set({
    email: ADMIN_EMAIL,
    name: 'ETNIKO Admin',
    phone: '',
    role: 'ADMIN',
    addresses: [],
    createdAt: now,
    updatedAt: now,
  }, { merge: true });
  console.log(`✅ Admin profile set to role ADMIN (uid: ${user.uid}).`);

  console.log('\n🎉 Seed complete.');
  process.exit(0);
}

main().catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); });
