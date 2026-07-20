import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, X, ChevronLeft, ChevronRight, Search as SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import { productService } from '../services/productService';
import ProductCard from '../components/common/ProductCard';
import SkeletonLoader from '../components/common/SkeletonLoader';

const FABRICS = ['ALL', 'Mulberry Silk', 'Banarasi Brocade', 'Chanderi Silk', 'Georgette', 'Organza', 'Tussar Silk', 'Raw Silk', 'Cotton Silk Blend'];
const COLORS = ['ALL', 'Ivory', 'Champagne Gold', 'Crimson Red', 'Emerald Green', 'Royal Blue', 'Dusty Pink', 'Midnight Black', 'Warm Mustard'];
const OCCASIONS = ['ALL', 'Bridal & Wedding', 'Festive & Pujas', 'Sangeet & Cocktails', 'Mehendi & Haldi', 'Royal Dinners'];

const PRICE_RANGES = [
  { label: 'All Prices', value: null },
  { label: 'Under ₹10,000', value: [0, 10000] },
  { label: '₹10,000 – ₹20,000', value: [10000, 20000] },
  { label: '₹20,000 – ₹30,000', value: [20000, 30000] },
  { label: 'Above ₹30,000', value: [30000, 100000] }
];

export default function Shop() {
  const [categories, setCategories] = useState(['ALL', 'WOMEN', 'MEN', 'KIDS']);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await productService.getCategories();
        if (cats && cats.length > 0) {
          const list = ['ALL', ...cats.filter(c => c.status === 'ACTIVE').map(c => c.name.toUpperCase())];
          setCategories(list);
        }
      } catch (err) {
        console.error('Error fetching shop categories:', err);
      }
    };
    fetchCategories();
  }, []);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Read filter states from URL search params to ensure shareable links
  const categoryParam = searchParams.get('category') || 'ALL';
  const subcategoryParam = searchParams.get('subcategory') || 'ALL';
  const fabricParam = searchParams.get('fabric') || 'ALL';
  const colorParam = searchParams.get('color') || 'ALL';
  const occasionParam = searchParams.get('occasion') || 'ALL';
  const sortParam = searchParams.get('sort') || 'newest';
  const searchParam = searchParams.get('q') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const priceMinParam = searchParams.get('min_price') ? parseInt(searchParams.get('min_price'), 10) : 0;
  const priceMaxParam = searchParams.get('max_price') ? parseInt(searchParams.get('max_price'), 10) : 100000;

  // Set local state for search input
  const [searchInput, setSearchInput] = useState(searchParam);

  // Sync search input with URL searchParam
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Dynamic Query Hook for loading products catalog
  const { data, isLoading } = useProducts({
    category: categoryParam,
    subcategory: subcategoryParam === 'ALL' ? undefined : subcategoryParam,
    fabric: fabricParam === 'ALL' ? undefined : fabricParam,
    color: colorParam === 'ALL' ? undefined : colorParam,
    occasion: occasionParam === 'ALL' ? undefined : occasionParam,
    priceRange: [priceMinParam, priceMaxParam],
    sort: sortParam,
    search: searchParam,
    page: pageParam,
    limit: 12
  });

  const products = data?.products || [];
  const pagination = data?.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 };
  const loading = isLoading;

  // Smooth scroll to top on page or filter changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryParam, subcategoryParam, fabricParam, colorParam, occasionParam, priceMinParam, priceMaxParam, sortParam, searchParam, pageParam]);

  const updateParam = (key, value, resetPage = true) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'ALL') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (resetPage) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('q', searchInput);
  };

  const handlePriceRangeSelect = (range) => {
    const newParams = new URLSearchParams(searchParams);
    if (range) {
      newParams.set('min_price', range[0]);
      newParams.set('max_price', range[1]);
    } else {
      newParams.delete('min_price');
      newParams.delete('max_price');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setSearchInput("");
  };

  const hasActiveFilters = categoryParam !== 'ALL' || subcategoryParam !== 'ALL' || fabricParam !== 'ALL' || colorParam !== 'ALL' || occasionParam !== 'ALL' || priceMinParam > 0 || priceMaxParam < 100000 || searchParam;

  return (
    <div className="relative bg-[#F1E8D5] text-[#2B2621] min-h-screen overflow-hidden">

      {/* Decorative background layer: warm radial glows + fine grain, sits behind all content */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7F0DF] via-[#EEE0BE] to-[#E2CE9C]" />
        <div
          className="absolute -top-40 -left-32 w-[560px] h-[560px] rounded-full opacity-70 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.32) 0%, rgba(212,175,55,0) 70%)' }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[620px] h-[620px] rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(182,141,64,0.3) 0%, rgba(182,141,64,0) 70%)' }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[480px] h-[480px] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0) 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10 space-y-8">

      {/* Page eyebrow / heading */}
      <div className="space-y-2 border-b border-[#E6DCCF] pb-6">
        <span className="text-[10px] tracking-[0.3em] text-[#B68D40] font-sans font-bold uppercase">The Collection</span>
        <h1 className="font-serif text-3xl md:text-4xl tracking-wide text-[#2B2621]">
          Shop Couture Garments
        </h1>
      </div>

      {/* Catalog Filters Controls & Grid wrapper */}
      <div className="relative">
        
        {/* Left Side: Desktop Filter Trigger — fixed floating pill, fully outside document flow so it never reserves grid width. Expands into a floating panel on hover */}
        <aside className="hidden md:block fixed left-6 top-32 z-40">
          <div className="relative inline-block group/sidebar">

          {/* Collapsed rail: always visible, invites hover */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#E6DCCF] bg-[#FFFCF8]/80 backdrop-blur-sm shadow-sm cursor-pointer transition-opacity duration-200 group-hover/sidebar:opacity-0 group-hover/sidebar:pointer-events-none">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#B68D40]" />
            <span className="text-[9px] tracking-widest text-[#B68D40] font-sans font-bold uppercase whitespace-nowrap">
              Filters
            </span>
          </div>

          {/* Floating panel: hidden until the rail (or panel itself) is hovered, overlays the grid rather than pushing it */}
          <div className="absolute top-0 left-0 w-[26rem] max-h-[80vh] overflow-y-auto pr-5 pl-5 py-6 custom-scrollbar space-y-6 rounded-lg border border-[#E6DCCF] bg-[#FFFCF8]/95 backdrop-blur-md shadow-xl opacity-0 invisible pointer-events-none -translate-x-1 transition-all duration-300 ease-out group-hover/sidebar:opacity-100 group-hover/sidebar:visible group-hover/sidebar:pointer-events-auto group-hover/sidebar:translate-x-0">

          {/* Header clear */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="w-full py-2.5 rounded-md border border-[#B42318]/70 text-[#B42318] text-[9px] tracking-widest font-sans font-semibold uppercase hover:bg-[#B42318] hover:text-white transition-colors duration-300"
            >
              Clear Active Filters
            </button>
          )}

          {/* Categories select list */}
          <div className="space-y-3">
            <h4 className="text-[10px] tracking-widest text-[#B68D40] font-sans font-bold uppercase border-b border-[#E6DCCF] pb-1.5">
              Categories
            </h4>
            <div className="flex flex-wrap gap-2 text-xs font-sans text-[#6E6E6E]">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => updateParam('category', cat)}
                  className={`px-3 py-1.5 rounded-full border text-[10px] tracking-wide transition-colors duration-300 ${
                    categoryParam === cat
                      ? 'border-[#B68D40] bg-[#B68D40] text-white shadow-sm'
                      : 'border-[#E6DCCF] hover:border-[#B68D40] text-[#6E6E6E]'
                  }`}
                >
                  {cat === 'ALL' ? 'All Garments' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range selections */}
          <div className="space-y-3">
            <h4 className="text-[10px] tracking-widest text-[#B68D40] font-sans font-bold uppercase border-b border-[#E6DCCF] pb-1.5">
              Price Range
            </h4>
            <div className="flex flex-wrap gap-2 text-xs font-sans text-[#6E6E6E]">
              {PRICE_RANGES.map((range, idx) => {
                const active = (!range.value && priceMinParam === 0 && priceMaxParam === 100000) ||
                  (range.value && priceMinParam === range.value[0] && priceMaxParam === range.value[1]);
                return (
                  <button
                    key={idx}
                    onClick={() => handlePriceRangeSelect(range.value)}
                    className={`px-3 py-1.5 rounded-full border text-[10px] tracking-wide transition-colors duration-300 ${
                      active
                        ? 'border-[#B68D40] bg-[#B68D40] text-white shadow-sm'
                        : 'border-[#E6DCCF] hover:border-[#B68D40] text-[#6E6E6E]'
                    }`}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fabrics selections */}
          <div className="space-y-3">
            <h4 className="text-[10px] tracking-widest text-[#B68D40] font-sans font-bold uppercase border-b border-[#E6DCCF] pb-1.5">
              Fabrics
            </h4>
            <div className="flex flex-wrap gap-2 text-xs font-sans text-[#6E6E6E]">
              {FABRICS.map(fab => (
                <button
                  key={fab}
                  onClick={() => updateParam('fabric', fab)}
                  className={`px-3 py-1.5 rounded-full border text-[10px] tracking-wide transition-colors duration-300 ${
                    fabricParam === fab
                      ? 'border-[#B68D40] bg-[#B68D40] text-white shadow-sm'
                      : 'border-[#E6DCCF] hover:border-[#B68D40] text-[#6E6E6E]'
                  }`}
                >
                  {fab === 'ALL' ? 'All Fabrics' : fab}
                </button>
              ))}
            </div>
          </div>

          {/* Colors selection */}
          <div className="space-y-3">
            <h4 className="text-[10px] tracking-widest text-[#B68D40] font-sans font-bold uppercase border-b border-[#E6DCCF] pb-1.5">
              Colors
            </h4>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(col => (
                <button
                  key={col}
                  onClick={() => updateParam('color', col)}
                  className={`px-3 py-1.5 rounded-full border text-[9px] tracking-wider uppercase transition-colors duration-300 font-sans ${
                    colorParam === col
                      ? 'border-[#B68D40] bg-[#B68D40] text-white shadow-sm'
                      : 'border-[#E6DCCF] hover:border-[#B68D40] text-[#6E6E6E]'
                  }`}
                >
                  {col === 'ALL' ? 'All Colors' : col}
                </button>
              ))}
            </div>
          </div>

          {/* Occasions selections */}
          <div className="space-y-3">
            <h4 className="text-[10px] tracking-widest text-[#B68D40] font-sans font-bold uppercase border-b border-[#E6DCCF] pb-1.5">
              Occasions
            </h4>
            <div className="flex flex-wrap gap-2 text-xs font-sans text-[#6E6E6E]">
              {OCCASIONS.map(occ => (
                <button
                  key={occ}
                  onClick={() => updateParam('occasion', occ)}
                  className={`px-3 py-1.5 rounded-full border text-[10px] tracking-wide transition-colors duration-300 ${
                    occasionParam === occ
                      ? 'border-[#B68D40] bg-[#B68D40] text-white shadow-sm'
                      : 'border-[#E6DCCF] hover:border-[#B68D40] text-[#6E6E6E]'
                  }`}
                >
                  {occ === 'ALL' ? 'All Occasions' : occ}
                </button>
              ))}
            </div>
          </div>

          </div>
          </div>
        </aside>

        {/* Right Side: Product Grid and Sorting headers */}
        <div className="space-y-6">
          
          {/* Header Controls: Sorting, search inputs, counts, mobile filters toggle */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#E6DCCF] pb-4">
            
            <div className="flex items-center justify-between md:justify-start gap-4">
              {/* Product count */}
              <span className="text-xs font-sans text-[#6E6E6E] uppercase tracking-widest">
                <span className="font-serif text-base text-[#B68D40] mr-1">{pagination.totalItems}</span>
                Garments found
              </span>
              
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="md:hidden flex items-center gap-1.5 px-4 py-2 rounded-md border border-[#E6DCCF] text-[10px] uppercase tracking-widest font-sans font-bold hover:border-[#B68D40] hover:text-[#B68D40] transition-colors focus:outline-none text-[#2B2621]"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Actions: Search bar & Sort selector */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Text Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative flex-grow md:flex-grow-0 md:w-56">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="SEARCH CATALOG..."
                  className="w-full bg-[#FFFCF8]/80 backdrop-blur-sm rounded-md border border-[#E6DCCF] py-2 pl-3 pr-8 text-xs font-sans tracking-wider text-[#2B2621] placeholder-[#9C948A] focus:outline-none focus:border-[#B68D40] focus:ring-1 focus:ring-[#B68D40]/40 uppercase transition-colors"
                />
                <button type="submit" className="absolute right-2 top-2.5 text-[#9C948A] hover:text-[#B68D40] transition-colors">
                  <SearchIcon className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Sorting */}
              <div className="flex items-center gap-1 rounded-md border border-[#E6DCCF] px-3 py-2 bg-[#FFFCF8]/80 backdrop-blur-sm shrink-0">
                <span className="text-[9px] uppercase tracking-widest text-[#9C948A] font-sans">Sort:</span>
                <select
                  value={sortParam}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="bg-transparent text-xs text-[#2B2621] font-sans font-semibold border-none outline-none focus:ring-0 cursor-pointer"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[9px] uppercase tracking-widest text-[#9C948A] font-sans mr-2">Active:</span>
              {categoryParam !== 'ALL' && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFFCF8] text-[10px] tracking-wide font-sans text-[#6E6E6E] border border-[#E6DCCF]">
                  <span>{categoryParam}</span>
                  <button onClick={() => updateParam('category', 'ALL')} className="text-[#9C948A] hover:text-[#B68D40] transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {fabricParam !== 'ALL' && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFFCF8] text-[10px] tracking-wide font-sans text-[#6E6E6E] border border-[#E6DCCF]">
                  <span>Fabric: {fabricParam}</span>
                  <button onClick={() => updateParam('fabric', 'ALL')} className="text-[#9C948A] hover:text-[#B68D40] transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {colorParam !== 'ALL' && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFFCF8] text-[10px] tracking-wide font-sans text-[#6E6E6E] border border-[#E6DCCF]">
                  <span>Color: {colorParam}</span>
                  <button onClick={() => updateParam('color', 'ALL')} className="text-[#9C948A] hover:text-[#B68D40] transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {occasionParam !== 'ALL' && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFFCF8] text-[10px] tracking-wide font-sans text-[#6E6E6E] border border-[#E6DCCF]">
                  <span>Occasion: {occasionParam}</span>
                  <button onClick={() => updateParam('occasion', 'ALL')} className="text-[#9C948A] hover:text-[#B68D40] transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(priceMinParam > 0 || priceMaxParam < 100000) && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFFCF8] text-[10px] tracking-wide font-sans text-[#6E6E6E] border border-[#E6DCCF]">
                  <span>₹{priceMinParam.toLocaleString()} - ₹{priceMaxParam.toLocaleString()}</span>
                  <button onClick={() => handlePriceRangeSelect(null)} className="text-[#9C948A] hover:text-[#B68D40] transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchParam && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFFCF8] text-[10px] tracking-wide font-sans text-[#6E6E6E] border border-[#E6DCCF]">
                  <span>Search: {searchParam}</span>
                  <button onClick={() => updateParam('q', '')} className="text-[#9C948A] hover:text-[#B68D40] transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="ml-1 flex items-center gap-1 px-3 py-1 rounded-full border border-[#B42318]/60 text-[#B42318] text-[10px] tracking-wide font-sans font-semibold uppercase hover:bg-[#B42318] hover:text-white transition-colors duration-300"
              >
                <X className="w-3 h-3" />
                Clear All
              </button>
            </div>
          )}

          {/* Product grid displaying items */}
          {loading ? (
            <SkeletonLoader count={8} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.55, delay: (idx % 3) * 0.08, ease: 'easeOut' }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            /* Empty state for search/filters */
            <div className="py-20 text-center space-y-4 rounded-lg border border-[#E6DCCF] bg-[#FFFCF8]/70 backdrop-blur-sm shadow-sm">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#B68D40]/10 flex items-center justify-center">
                <SearchIcon className="w-5 h-5 text-[#B68D40]" />
              </div>
              <h3 className="font-serif text-xl tracking-wider text-[#2B2621] uppercase">
                No matching couture garments
              </h3>
              <p className="text-xs text-[#6E6E6E] uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                Try clearing some active filters or modifying search keywords to explore alternative fabrics.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 inline-block px-8 py-3 rounded-md bg-gradient-to-r from-[#B68D40] to-[#D4AF37] text-white text-[10px] font-sans font-bold uppercase tracking-widest shadow-sm hover:shadow-md hover:opacity-95 transition-all duration-300"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination controls */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-6 pt-10 border-t border-[#E6DCCF]">
              <button
                onClick={() => updateParam('page', pageParam - 1)}
                disabled={pageParam === 1}
                className="p-2 rounded-md border border-[#E6DCCF] hover:border-[#B68D40] hover:text-[#B68D40] disabled:opacity-30 disabled:hover:border-[#E6DCCF] transition-colors duration-300 focus:outline-none"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4 text-[#2B2621]" />
              </button>

              <span className="text-xs font-sans text-[#6E6E6E] uppercase tracking-widest font-semibold">
                Page <span className="font-serif text-sm text-[#B68D40]">{pagination.currentPage}</span> of {pagination.totalPages}
              </span>

              <button
                onClick={() => updateParam('page', pageParam + 1)}
                disabled={pageParam === pagination.totalPages}
                className="p-2 rounded-md border border-[#E6DCCF] hover:border-[#B68D40] hover:text-[#B68D40] disabled:opacity-30 disabled:hover:border-[#E6DCCF] transition-colors duration-300 focus:outline-none"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4 text-[#2B2621]" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Filters Side Drawer overlay */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex justify-start md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-sm"
            />

            {/* Filter Drawer Body */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.4 }}
              className="relative w-4/5 max-w-sm bg-[#FAF7F2] h-full flex flex-col p-6 shadow-2xl z-10 overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-[#E6DCCF] pb-4 mb-6">
                <span className="font-serif text-lg tracking-wider text-[#2B2621]">FILTERS</span>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-1 focus:outline-none text-[#2B2621] hover:text-[#B68D40] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h5 className="text-[10px] tracking-widest text-[#B68D40] font-sans font-bold uppercase">Categories</h5>
                  <div className="flex flex-col space-y-2 text-xs font-sans text-[#6E6E6E]">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          updateParam('category', cat);
                          setMobileFiltersOpen(false);
                        }}
                        className={`text-left ${categoryParam === cat ? 'text-[#B68D40] font-semibold' : ''}`}
                      >
                        {cat === 'ALL' ? 'All Garments' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div className="space-y-2">
                  <h5 className="text-[10px] tracking-widest text-[#B68D40] font-sans font-bold uppercase">Price Range</h5>
                  <div className="flex flex-col space-y-2 text-xs font-sans text-[#6E6E6E]">
                    {PRICE_RANGES.map((range, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handlePriceRangeSelect(range.value);
                          setMobileFiltersOpen(false);
                        }}
                        className={`text-left ${
                          (!range.value && priceMinParam === 0 && priceMaxParam === 100000) ||
                          (range.value && priceMinParam === range.value[0] && priceMaxParam === range.value[1])
                            ? 'text-[#B68D40] font-semibold'
                            : ''
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fabrics */}
                <div className="space-y-2">
                  <h5 className="text-[10px] tracking-widest text-[#B68D40] font-sans font-bold uppercase">Fabrics</h5>
                  <div className="flex flex-col space-y-2 text-xs font-sans text-[#6E6E6E]">
                    {FABRICS.map(fab => (
                      <button
                        key={fab}
                        onClick={() => {
                          updateParam('fabric', fab);
                          setMobileFiltersOpen(false);
                        }}
                        className={`text-left ${fabricParam === fab ? 'text-[#B68D40] font-semibold' : ''}`}
                      >
                        {fab === 'ALL' ? 'All Fabrics' : fab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-2">
                  <h5 className="text-[10px] tracking-widest text-[#B68D40] font-sans font-bold uppercase">Colors</h5>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(col => (
                      <button
                        key={col}
                        onClick={() => {
                          updateParam('color', col);
                          setMobileFiltersOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-full border text-[9px] tracking-wider uppercase transition-colors font-sans ${
                          colorParam === col
                            ? 'border-[#B68D40] bg-[#B68D40] text-white'
                            : 'border-[#E6DCCF] text-[#6E6E6E]'
                        }`}
                      >
                        {col === 'ALL' ? 'All Colors' : col}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Occasions */}
                <div className="space-y-2">
                  <h5 className="text-[10px] tracking-widest text-[#B68D40] font-sans font-bold uppercase">Occasions</h5>
                  <div className="flex flex-col space-y-2 text-xs font-sans text-[#6E6E6E]">
                    {OCCASIONS.map(occ => (
                      <button
                        key={occ}
                        onClick={() => {
                          updateParam('occasion', occ);
                          setMobileFiltersOpen(false);
                        }}
                        className={`text-left ${occasionParam === occ ? 'text-[#B68D40] font-semibold' : ''}`}
                      >
                        {occ === 'ALL' ? 'All Occasions' : occ}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={() => { clearAllFilters(); setMobileFiltersOpen(false); }}
                  className="mt-8 w-full py-2.5 rounded-md border border-[#B42318]/70 text-[#B42318] text-[9px] tracking-widest font-sans font-semibold uppercase hover:bg-[#B42318] hover:text-white transition-colors duration-300"
                >
                  Clear Active Filters
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
}