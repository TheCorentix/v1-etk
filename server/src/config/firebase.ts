import admin from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';
import { env } from './env';

const serviceAccountPath = path.isAbsolute(env.FIREBASE_SERVICE_ACCOUNT_PATH)
  ? env.FIREBASE_SERVICE_ACCOUNT_PATH
  : path.resolve(process.cwd(), env.FIREBASE_SERVICE_ACCOUNT_PATH);

let firestoreInstance: any;
let authInstance: any;

if (!fs.existsSync(serviceAccountPath)) {
  console.warn(`⚠️ Warning: Firebase service account file not found at: ${serviceAccountPath}`);
  console.warn('⚠️ Server will run in OFFLINE MOCK MODE. Database operations will use local in-memory stores.');

  // Create a minimal in-memory mock Firestore client to avoid credential load failures
  const store: Record<string, any[]> = {};
  
  // Seed initial products so the catalog is pre-populated
  store.products = [
    {
      id: "prod-1",
      name: "Blush Rose Organza Saree",
      slug: "blush-rose-organza-saree",
      sku: "WOM-ORG-0001",
      category: "WOMEN",
      subcategory: "Sarees",
      price: 1850000, // in Paise
      fabric: "Organza Silk",
      color: "Gold",
      occasion: "Bridal & Wedding",
      stock: 5,
      description: "Intricately embroidered blush rose organza saree with hand-turned scalloped gota edges.",
      story: "Crafted by hand in Lucknow over 3 weeks.",
      images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"],
      sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
      id: "prod-2",
      name: "Mustard Silk Anarkali",
      slug: "mustard-silk-anarkali",
      sku: "WOM-CHA-0002",
      category: "WOMEN",
      subcategory: "Anarkalis",
      price: 1650000,
      fabric: "Chanderi Silk",
      color: "Warm Mustard",
      occasion: "Festive & Pujas",
      stock: 4,
      description: "Mustard yellow traditional pleated Chanderi Anarkali with subtle gold block prints.",
      story: "Traditional Chanderi weave.",
      images: ["https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80"],
      sizes: ["S", "M", "L"]
    },
    {
      id: "prod-3",
      name: "Teal Zardozi Lehenga",
      slug: "teal-zardozi-lehenga",
      sku: "WOM-RAW-0003",
      category: "WOMEN",
      subcategory: "Lehengas",
      price: 3680000,
      fabric: "Raw Silk",
      color: "Royal Blue",
      occasion: "Sangeet & Cocktails",
      stock: 2,
      description: "Stunning teal blue raw silk lehenga features detailed gold zardozi leaf work.",
      story: "Zardozi hand-crafted embellishment.",
      images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"],
      sizes: ["S", "M", "L"]
    },
    {
      id: "prod-4",
      name: "Beige Threadwork Kurta",
      slug: "beige-threadwork-kurta",
      sku: "MEN-TUS-0004",
      category: "MEN",
      subcategory: "Kurtas",
      price: 6450000,
      fabric: "Tussar Silk",
      color: "Ivory",
      occasion: "Festive & Pujas",
      stock: 8,
      description: "Classic self-thread embroidered kurta in premium beige handloom silk.",
      story: "Tussar handloom silk.",
      images: ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80"],
      sizes: ["M", "L", "XL"]
    }
  ];

  const createMockDb = () => {
    return {
      collection: (colName: string) => {
        if (!store[colName]) store[colName] = [];
        return {
          doc: (docId?: string) => {
            const id = docId || Math.random().toString(36).substring(7);
            return {
              id,
              get: async () => {
                const item = store[colName].find(x => x.id === id);
                return {
                  exists: !!item,
                  data: () => item,
                };
              },
              set: async (data: any, options?: any) => {
                const index = store[colName].findIndex(x => x.id === id);
                const record = { id, ...data };
                if (index > -1) {
                  if (options?.merge) {
                    store[colName][index] = { ...store[colName][index], ...data };
                  } else {
                    store[colName][index] = record;
                  }
                } else {
                  store[colName].push(record);
                }
              },
              update: async (data: any) => {
                const index = store[colName].findIndex(x => x.id === id);
                if (index > -1) {
                  store[colName][index] = { ...store[colName][index], ...data };
                }
              },
              delete: async () => {
                store[colName] = store[colName].filter(x => x.id !== id);
              }
            };
          },
          add: async (data: any) => {
            const id = Math.random().toString(36).substring(7);
            const record = { id, ...data };
            store[colName].push(record);
            return { id };
          },
          get: async () => {
            const docs = store[colName].map(item => ({
              id: item.id,
              data: () => item,
            }));
            return {
              docs,
              forEach: (callback: any) => docs.forEach(callback)
            };
          },
          where: function(field: string, op: string, value: any) {
            return {
              get: async () => {
                let filtered = store[colName] || [];
                if (op === '==') {
                  filtered = filtered.filter(x => x[field] === value);
                } else if (op === 'array-contains') {
                  filtered = filtered.filter(x => Array.isArray(x[field]) && x[field].includes(value));
                }
                const docs = filtered.map(item => ({
                  id: item.id,
                  data: () => item,
                }));
                return {
                  docs,
                  forEach: (callback: any) => docs.forEach(callback)
                };
              },
              limit: function() { return this; },
              orderBy: function() { return this; }
            };
          },
          limit: function() { return this; },
          orderBy: function() { return this; }
        };
      },
      settings: () => {}
    };
  };

  firestoreInstance = createMockDb();
  
  authInstance = {
    verifyIdToken: async (token: string) => {
      try {
        const parsed = JSON.parse(token);
        if (parsed && parsed.mock) {
          return {
            uid: 'mock_uid_' + parsed.email.replace(/[^a-zA-Z0-9]/g, ''),
            email: parsed.email,
            name: parsed.email.split('@')[0].toUpperCase(),
          };
        }
      } catch (e) {}

      return {
        uid: 'mock_uid_123',
        email: 'stylist@etniko.studio',
        name: 'ETNIKO Guest',
      };
    },
    getUser: async (uid: string) => {
      return {
        uid,
        email: 'stylist@etniko.studio',
        displayName: 'ETNIKO Guest',
      };
    }
  };
} else {
  try {
    if (getApps().length === 0) {
      const credential = cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')));
      initializeApp({
        credential,
        projectId: env.FIREBASE_PROJECT_ID,
      });
    }

    firestoreInstance = getFirestore();
    authInstance = getAuth();

    firestoreInstance.settings({
      ignoreUndefinedProperties: true,
    });

    console.log('🔥 Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    process.exit(1);
  }
}

export const db = firestoreInstance;
export const auth = authInstance;
export default admin;
