import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function QuickViewModal({ isOpen, onClose, product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState("M");
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const favorited = isInWishlist(product.id);
  const activePrice = product.discountPrice || product.price;

  const handleAdd = () => {
    addToCart(product, selectedSize, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-3xl bg-white dark:bg-[#181818] border border-[#ECECEC] dark:border-neutral-800 shadow-2xl flex flex-col md:flex-row overflow-hidden z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-neutral-800/90 text-neutral-800 dark:text-primary rounded-full hover:text-[#B68D40] transition-colors focus:outline-none z-20"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Column: Image showcase */}
            <div className="w-full md:w-1/2 aspect-[3/4] bg-neutral-100 relative">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-4 left-4 bg-white/90 dark:bg-neutral-900/90 text-[8px] tracking-[0.2em] px-2.5 py-1 text-neutral-800 dark:text-primary uppercase font-sans font-medium">
                {product.fabric}
              </span>
            </div>

            {/* Right Column: Information details */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-between space-y-6">
              
              {/* Product Info */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#B68D40] font-sans font-semibold">
                    {product.designer}
                  </span>
                  <h3 className="font-serif text-xl text-neutral-900 dark:text-primary uppercase tracking-wide leading-tight">
                    {product.name}
                  </h3>
                </div>

                <div className="flex items-center gap-3 font-sans text-base">
                  <span className="font-semibold text-neutral-900 dark:text-primary">
                    ₹{activePrice.toLocaleString('en-IN')}
                  </span>
                  {product.discountPrice && (
                    <span className="text-neutral-400 line-through text-xs">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <p className="text-[11px] font-sans leading-relaxed text-neutral-500 dark:text-neutral-400 text-justify">
                  {product.description}
                </p>
              </div>

              {/* Sizing options */}
              <div className="space-y-3">
                <span className="text-[9px] tracking-widest text-neutral-400 font-sans block uppercase font-medium">
                  SELECT SIZE
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3 py-1.5 border text-[10px] tracking-wider uppercase transition-colors font-sans focus:outline-none ${
                        selectedSize === sz
                          ? 'border-[#B68D40] bg-[#B68D40] text-white'
                          : 'border-[#ECECEC] dark:border-neutral-800 hover:border-[#B68D40]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions row */}
              <div className="space-y-4 pt-2">
                <div className="flex gap-3">
                  {product.stock > 0 ? (
                    <button
                      onClick={handleAdd}
                      className="flex-grow btn-luxury-solid flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{added ? "ADDED TO BAG" : "ADD TO COUTURE BAG"}</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-grow py-3.5 bg-neutral-200 text-neutral-400 text-xs uppercase tracking-widest cursor-not-allowed font-sans text-center"
                    >
                      OUT OF STOCK
                    </button>
                  )}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="p-3 border border-[#ECECEC] dark:border-neutral-800 text-neutral-800 dark:text-primary hover:border-[#B68D40] transition-colors focus:outline-none"
                    aria-label="Wishlist toggle"
                  >
                    <Heart className={`w-4 h-4 ${favorited ? 'fill-[#B68D40] text-[#B68D40]' : ''}`} />
                  </button>
                </div>

                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="text-[10px] uppercase tracking-widest text-[#B68D40] hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1.5 font-sans font-semibold"
                >
                  <span>View Full Couture Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
