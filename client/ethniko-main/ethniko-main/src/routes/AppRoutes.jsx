import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminRoute } from '../components/common/RouteGuards';

// Lazy load pages for production performance
const Home = lazy(() => import('../pages/Home'));
const Shop = lazy(() => import('../pages/Shop'));
const ProductDetails = lazy(() => import('../pages/ProductDetails'));
const LookAndShop = lazy(() => import('../pages/LookAndShop'));
const Customize = lazy(() => import('../pages/Customize'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const Profile = lazy(() => import('../pages/Profile'));
const Admin = lazy(() => import('../pages/Admin'));
const AccessDenied = lazy(() => import('../pages/AccessDenied'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Premium minimal luxury loading screen
const PageLoading = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#FFFFFF] dark:bg-[#181818]">
    <div className="relative w-16 h-16 flex items-center justify-center">
      {/* Outer spinning gold frame */}
      <div className="absolute border border-t-[#B68D40] border-[#ECECEC] rounded-full w-12 h-12 animate-spin duration-1000" />
      {/* Centered initial */}
      <span className="font-serif text-[#B68D40] text-sm font-semibold tracking-widest uppercase">E</span>
    </div>
    <span className="mt-4 text-[9px] uppercase tracking-widest text-[#B68D40] animate-pulse">ETNIKO Studio</span>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/look-and-shop" element={<LookAndShop />} />
        <Route path="/customize" element={<Customize />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
