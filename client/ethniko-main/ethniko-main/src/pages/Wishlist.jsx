import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, "M", 1);
    removeFromWishlist(product.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
      
      {/* Page Header */}
      <div className="text-center py-6 border-b border-[#ECECEC] dark:border-neutral-800 space-y-2">
        <span className="text-[9px] uppercase tracking-[0.4em] text-[#B68D40] font-sans font-bold">YOUR ARCHIVE</span>
        <h1 className="text-4xl font-serif font-light tracking-wide uppercase text-text-custom dark:text-primary">MY WISHLIST</h1>
        <p className="text-xs font-sans text-neutral-500 uppercase tracking-widest max-w-lg mx-auto">
          Review your curated designer edits, favorite weaves, and custom silhouettes.
        </p>
      </div>

      {wishlist.length > 0 ? (
        /* Wishlist Grid */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const activePrice = item.discountPrice || item.price;
            return (
              <div
                key={item.id}
                className="group relative flex flex-col bg-white dark:bg-[#1f1f1f] border border-[#ECECEC] dark:border-neutral-800 transition-all duration-500 overflow-hidden"
              >
                {/* Image frame */}
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50 dark:bg-neutral-900">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  />
                  
                  {/* Remove Button overlay */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3.5 right-3.5 p-2 bg-white/95 dark:bg-neutral-800/95 text-[#B42318] rounded-full hover:bg-[#B42318] hover:text-white transition-all focus:outline-none"
                    aria-label="Remove item from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details info */}
                <div className="p-4 flex-grow flex flex-col justify-between space-y-4 bg-white dark:bg-[#181818] border-t border-[#ECECEC] dark:border-neutral-800">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-sans block">
                      {item.designer}
                    </span>
                    <Link
                      to={`/product/${item.slug}`}
                      className="font-serif text-[11px] uppercase tracking-wider text-text-custom dark:text-primary hover:text-[#B68D40] transition-colors leading-snug line-clamp-1 block"
                    >
                      {item.name}
                    </Link>
                    <span className="text-[9px] font-sans text-neutral-500 italic block">
                      {item.fabric}
                    </span>
                    <div className="flex items-center gap-2 pt-1 font-sans text-xs">
                      <span className="font-semibold text-neutral-900 dark:text-primary">
                        ₹{activePrice.toLocaleString('en-IN')}
                      </span>
                      {item.discountPrice && (
                        <span className="text-neutral-400 line-through text-[10px]">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/50">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="w-full py-2.5 bg-neutral-900 hover:bg-[#B68D40] text-white text-[9px] font-sans font-semibold uppercase tracking-widest transition-colors duration-300 flex items-center justify-center gap-1.5 focus:outline-none"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Wishlist State */
        <div className="py-24 text-center space-y-6 max-w-md mx-auto">
          <div className="w-16 h-16 border border-neutral-300 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 text-neutral-300" />
          </div>
          <h3 className="font-serif text-xl tracking-wider text-text-custom dark:text-primary uppercase">
            Your wishlist is empty
          </h3>
          <p className="text-xs text-neutral-500 uppercase tracking-widest leading-relaxed">
            Curate your lookbook by hearting products in our shop catalog to save them for later styling.
          </p>
          <div className="pt-4">
            <Link to="/shop" className="btn-luxury">
              Explore Couture Catalog
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
