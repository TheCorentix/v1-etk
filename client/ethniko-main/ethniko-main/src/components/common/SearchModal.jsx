import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Search, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../../context/SearchContext';

export default function SearchModal() {
  const {
    isOpen,
    closeSearch,
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    recentSearches,
    trendingSearches,
    popularProducts,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches
  } = useSearch();

  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
    }
  };

  const handleSuggestionClick = (term) => {
    setSearchQuery(term);
    addRecentSearch(term);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center">
          
          {/* Glass backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-white/90 dark:bg-[#181818]/90 backdrop-blur-md"
          />

          {/* Search Content Overlay */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-4xl bg-transparent px-6 py-12 md:py-20 z-10 flex flex-col max-h-screen overflow-y-auto custom-scrollbar"
          >
            {/* Close Button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={closeSearch}
                className="p-3 border border-neutral-300 dark:border-neutral-700 rounded-full hover:border-[#B68D40] hover:text-[#B68D40] dark:text-primary transition-all focus:outline-none"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Bar Form */}
            <form onSubmit={handleSearchSubmit} className="relative w-full border-b border-neutral-800 dark:border-neutral-200 pb-4">
              <Search className="absolute left-1 top-2.5 w-6 h-6 text-neutral-400 dark:text-neutral-500" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH DESIGNER COUTURE..."
                className="w-full pl-12 pr-10 bg-transparent text-xl md:text-3xl font-serif tracking-widest text-[#181818] dark:text-[#F8F6F2] placeholder-neutral-400 border-none outline-none focus:ring-0 uppercase"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-3.5 p-1 text-neutral-400 hover:text-[#B68D40] focus:outline-none"
                  aria-label="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Loading placeholder */}
            {isLoading ? (
              <div className="py-20 flex justify-center items-center">
                <span className="font-serif italic text-sm text-[#B68D40] animate-pulse">Sifting Archives...</span>
              </div>
            ) : searchQuery ? (
              /* Search Results Panel */
              <div className="py-8">
                {searchResults.length > 0 ? (
                  <div className="space-y-6">
                    <span className="text-[10px] tracking-[0.25em] font-sans font-semibold text-[#B68D40] uppercase">
                      MATCHING RESULTS ({searchResults.length})
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.slug}`}
                          onClick={closeSearch}
                          className="group space-y-3 cursor-pointer"
                        >
                          <div className="aspect-[3/4] bg-neutral-100 overflow-hidden border border-neutral-200/50">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-serif text-[11px] uppercase tracking-wider text-[#181818] dark:text-[#F8F6F2] leading-tight">
                              {product.name}
                            </h4>
                            <p className="text-[10px] font-sans text-neutral-500 font-medium">
                              ₹{(product.discountPrice || product.price).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* No Results State */
                  <div className="py-16 text-center space-y-4">
                    <h3 className="font-serif text-lg tracking-wider text-text-custom dark:text-primary uppercase">
                      No matching garments found
                    </h3>
                    <p className="text-xs text-neutral-500 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                      We couldn't find anything matching "{searchQuery}". Try searching for categories like "Saree", "Lehenga", or "Sherwani".
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Static Initial Suggestions Grid */
              <div className="py-10 grid grid-cols-1 md:grid-cols-3 gap-12">
                
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                      <span className="text-[10px] tracking-[0.25em] font-sans font-semibold text-[#B68D40] uppercase">
                        RECENT LOOKUPS
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[9px] font-sans text-neutral-400 hover:text-[#B42318] flex items-center gap-1 focus:outline-none"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>CLEAR</span>
                      </button>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {recentSearches.map((term) => (
                        <div key={term} className="flex justify-between items-center group">
                          <button
                            onClick={() => handleSuggestionClick(term)}
                            className="text-xs font-sans text-left text-neutral-600 dark:text-neutral-300 hover:text-[#B68D40] transition-colors"
                          >
                            {term}
                          </button>
                          <button
                            onClick={() => removeRecentSearch(term)}
                            className="text-neutral-300 hover:text-[#B42318] p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Delete query history"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending searches tags list */}
                <div className="space-y-4">
                  <div className="border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <span className="text-[10px] tracking-[0.25em] font-sans font-semibold text-[#B68D40] uppercase">
                      TRENDING NOW
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {trendingSearches.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleSuggestionClick(tag)}
                        className="px-3.5 py-1.5 border border-neutral-200 dark:border-neutral-800 text-[10px] tracking-wider uppercase hover:border-[#B68D40] hover:text-[#B68D40] transition-colors font-sans text-neutral-600 dark:text-neutral-300"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Recommended items */}
                <div className="space-y-4 md:col-span-1">
                  <div className="border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <span className="text-[10px] tracking-[0.25em] font-sans font-semibold text-[#B68D40] uppercase">
                      POPULAR ITEMS
                    </span>
                  </div>
                  <div className="space-y-4">
                    {popularProducts.map((p) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.slug}`}
                        onClick={closeSearch}
                        className="flex gap-3.5 items-center group cursor-pointer"
                      >
                        <div className="w-12 aspect-[3/4] bg-neutral-100 overflow-hidden border border-neutral-200/50 shrink-0">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <h5 className="font-serif text-[11px] uppercase tracking-wider text-[#181818] dark:text-[#F8F6F2] group-hover:text-[#B68D40] transition-colors leading-tight">
                            {p.name}
                          </h5>
                          <p className="text-[9px] font-sans text-neutral-500 font-medium">
                            ₹{(p.discountPrice || p.price).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
