import { Router } from 'express';
import { HomepageController } from '../controllers/homepage.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

console.log('✅ Homepage routes loaded');

const uploadDir = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

const router = Router();
const controller = new HomepageController();

// =====================================================
// DEBUG MIDDLEWARE
// =====================================================

router.use((req, res, next) => {
  console.log(
    `[Homepage Router] ${req.method} ${req.originalUrl}`
  );
  next();
});

// =====================================================
// DEBUG TEST ROUTE
// =====================================================

router.get('/test', (req, res) => {
  console.log('✅ Homepage test route reached');

  res.status(200).json({
    success: true,
    message: 'Homepage router is working',
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// BANNERS
// =====================================================

router.get('/banners', (req, res, next) => {
  console.log('GET /banners');
  controller.listBanners(req, res, next);
});

router.post(
  '/banners',
  authMiddleware,
  adminMiddleware,
  upload.fields([{ name: 'image', maxCount: 1 }]),
  controller.createBanner
);

router.put(
  '/banners/:id',
  authMiddleware,
  adminMiddleware,
  upload.fields([{ name: 'image', maxCount: 1 }]),
  controller.updateBanner
);

router.delete(
  '/banners/:id',
  authMiddleware,
  adminMiddleware,
  controller.deleteBanner
);

// =====================================================
// SECTIONS
// =====================================================

router.get('/sections', (req, res, next) => {
  console.log('GET /sections');
  controller.listSections(req, res, next);
});

router.post(
  '/sections',
  authMiddleware,
  adminMiddleware,
  upload.fields([{ name: 'image', maxCount: 1 }]),
  controller.createSection
);

router.put(
  '/sections/:id',
  authMiddleware,
  adminMiddleware,
  upload.fields([{ name: 'image', maxCount: 1 }]),
  controller.updateSection
);

router.delete(
  '/sections/:id',
  authMiddleware,
  adminMiddleware,
  controller.deleteSection
);

// =====================================================
// STATISTICS
// =====================================================

router.get('/statistics', controller.listStatistics);

router.post(
  '/statistics',
  authMiddleware,
  adminMiddleware,
  controller.createStatistic
);

router.put(
  '/statistics/:id',
  authMiddleware,
  adminMiddleware,
  controller.updateStatistic
);

router.delete(
  '/statistics/:id',
  authMiddleware,
  adminMiddleware,
  controller.deleteStatistic
);

// =====================================================
// ANNOUNCEMENT BAR
// =====================================================

router.get('/announcement-bar', controller.getAnnouncementBar);

router.put(
  '/announcement-bar',
  authMiddleware,
  adminMiddleware,
  controller.updateAnnouncementBar
);

// =====================================================
// VIDEO
// =====================================================

router.get('/video', controller.getVideo);

router.put(
  '/video',
  authMiddleware,
  adminMiddleware,
  upload.fields([{ name: 'video', maxCount: 1 }]),
  controller.updateVideo
);

export default router;