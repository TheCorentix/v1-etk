import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const favorited = isInWishlist(product.id);
  const discount = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const activePrice = product.discountPrice || product.price;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes[0] || "M", 1);
  };

  return (
    <>
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative flex flex-col bg-white dark:bg-[#1f1f1f] border border-[#ECECEC] dark:border-neutral-800 transition-all duration-500 overflow-hidden"
      >
        {/* Image Frame */}
        <Link to={`/product/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-neutral-50 dark:bg-neutral-900">
          
          {/* Main & Secondary Hover Images */}
          <img
            src={product.images[0]}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-1000 ease-out ${
              hovered && product.images[1] ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
          />
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt={`${product.name} alternate view`}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out ${
                hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            />
          )}

          {/* Badges Overlays */}
          <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10 pointer-events-none">
            {discount > 0 && (
              <span className="bg-[#B42318] text-white text-[8px] font-sans font-semibold tracking-wider px-2.5 py-1 uppercase rounded-none">
                {discount}% OFF
              </span>
            )}
            {product.fabric.includes("Handloom") && (
              <span className="bg-[#B68D40] text-white text-[8px] font-sans font-semibold tracking-wider px-2.5 py-1 uppercase rounded-none">
                HANDLOOM
              </span>
            )}
            {product.stock <= 3 && product.stock > 0 && (
              <span className="bg-orange-600 text-white text-[8px] font-sans font-semibold tracking-wider px-2.5 py-1 uppercase rounded-none">
                ONLY {product.stock} LEFT
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-neutral-800 text-white text-[8px] font-sans font-semibold tracking-wider px-2.5 py-1 uppercase rounded-none">
                SOLD OUT
              </span>
            )}
          </div>

          {/* Wishlist Button Overlay */}
          <button
            onClick={handleWishlistClick}
            className="absolute top-3.5 right-3.5 p-2.5 bg-white/80 dark:bg-[#181818]/80 backdrop-blur-md text-neutral-800 dark:text-primary rounded-full hover:bg-[#B68D40] hover:text-white transition-all z-10 duration-300 focus:outline-none"
            aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${favorited ? 'fill-[#B68D40] text-[#B68D40]' : ''}`} />
          </button>

          {/* Bottom Action Sliders (Quick Sizing / Actions) */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end gap-2.5">
            {/* Quick Sizing overview */}
            <div className="flex justify-center gap-1.5">
              {product.sizes.slice(0, 4).map(sz => (
                <span
                  key={sz}
                  className="bg-white/90 text-[8px] font-sans font-bold tracking-wider px-1.5 py-0.5 text-neutral-800"
                >
                  {sz}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="bg-white/90 text-[8px] font-sans font-bold tracking-wider px-1 py-0.5 text-neutral-800">
                  +
                </span>
              )}
            </div>
            
            {/* Quick action buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setQuickViewOpen(true);
                }}
                className="flex-grow py-2 bg-white/95 text-neutral-900 hover:bg-[#B68D40] hover:text-white text-[9px] font-sans font-semibold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Quick View</span>
              </button>
              {product.stock > 0 && (
                <button
                  onClick={handleQuickAdd}
                  className="p-2 bg-[#B68D40] text-white hover:bg-neutral-900 transition-colors duration-300"
                  aria-label="Quick Add to Bag"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </Link>

        {/* Text Details Description */}
        <div className="p-4 flex-grow flex flex-col justify-between space-y-1 bg-white dark:bg-[#181818] z-10 border-t border-[#ECECEC] dark:border-neutral-800">
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-sans block">
              {product.designer}
            </span>
            <Link
              to={`/product/${product.slug}`}
              className="font-serif text-[11px] uppercase tracking-wider text-neutral-800 dark:text-primary hover:text-[#B68D40] transition-colors leading-snug line-clamp-1 block"
            >
              {product.name}
            </Link>
            <span className="text-[9px] font-sans text-neutral-500 italic block">
              {product.fabric}
            </span>
          </div>

          {/* Pricing Row */}
          <div className="flex items-center gap-2 pt-1 font-sans text-xs">
            <span className="font-semibold text-neutral-900 dark:text-primary">
              ₹{activePrice.toLocaleString('en-IN')}
            </span>
            {product.discountPrice && (
              <span className="text-neutral-400 line-through text-[10px]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick View Modal integration */}
      <QuickViewModal
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        product={product}
      />
    </>
  );
}
