import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Ruler, Star, Check, HelpCircle, ChevronRight, Play, VolumeX, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../services/productService';
import { mockReviews } from '../mock/reviews';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/common/ProductCard';
import SkeletonLoader from '../components/common/SkeletonLoader';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });
  
  // Tab control
  const [activeTab, setActiveTab] = useState("description");
  
  // Custom reviews
  const [reviews, setReviews] = useState([]);
  
  // Size, Color, Fabric pickers
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedFabric, setSelectedFabric] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Video settings
  const [videoMuted, setVideoMuted] = useState(true);

  // Recently Viewed
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Fetch product data
  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductBySlug(slug);
        if (data) {
          setProduct(data);
          setActiveImage(data.images[0]);
          
          const uniqueColors = Array.from(new Set(data.variants?.map(v => v.color).filter(Boolean) || []));
          const uniqueFabrics = Array.from(new Set(data.variants?.map(v => v.fabric).filter(Boolean) || []));
          const uniqueSizes = Array.from(new Set(data.variants?.map(v => v.size).filter(Boolean) || []));
          
          setSelectedSize(uniqueSizes[0] || data.sizes[0] || "M");
          setSelectedColor(uniqueColors[0] || "");
          setSelectedFabric(uniqueFabrics[0] || "");
          setQty(1);

          // Get reviews matching this product ID
          const prodReviews = mockReviews.filter(r => r.productId === data.id);
          setReviews(prodReviews);

          // Manage recently viewed history
          trackRecentlyViewed(data);
        } else {
          navigate('/404');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [slug]);

  // Load recently viewed details on change
  useEffect(() => {
    const savedIds = JSON.parse(localStorage.getItem('etniko_recent_ids') || '[]');
    // Load products matching these IDs, excluding current product
    const loadRecentProducts = async () => {
      if (product) {
        const filteredIds = savedIds.filter(id => id !== product.id).slice(0, 4);
        const resolved = await Promise.all(
          filteredIds.map(async (id) => {
            const res = await productService.getProductById(id);
            return res;
          })
        );
        setRecentlyViewed(resolved.filter(Boolean));
      }
    };
    if (product) {
      loadRecentProducts();
    }
  }, [product]);

  const trackRecentlyViewed = (prod) => {
    const savedIds = JSON.parse(localStorage.getItem('etniko_recent_ids') || '[]');
    const filtered = savedIds.filter(id => id !== prod.id);
    const updated = [prod.id, ...filtered].slice(0, 5); // limit to 5
    localStorage.setItem('etniko_recent_ids', JSON.stringify(updated));
  };

  // Find matching variant
  const matchingVariant = product?.variants?.find(
    v => (!v.size || v.size === selectedSize) && 
         (!v.color || v.color === selectedColor) && 
         (!v.fabric || v.fabric === selectedFabric)
  );

  // Update active image when variant changes
  useEffect(() => {
    if (matchingVariant && matchingVariant.images && matchingVariant.images.length > 0) {
      setActiveImage(matchingVariant.images[0]);
    }
  }, [matchingVariant]);

  const handleZoomMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${activeImage})`,
      backgroundSize: '200%'
    });
  };

  const handleZoomLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  const handleAddToCart = () => {
    if (!product) return;
    const itemToAdd = {
      ...product,
      sku: matchingVariant ? matchingVariant.sku : product.sku,
      price: matchingVariant ? matchingVariant.price : product.price,
    };
    addToCart(itemToAdd, selectedSize, qty, {
      variantId: matchingVariant?.id,
      color: selectedColor,
      fabric: selectedFabric,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return <SkeletonLoader layout="detail" />;
  }

  if (!product) return null;

  const favorited = isInWishlist(product.id);
  
  const activePrice = matchingVariant ? matchingVariant.price : (product.discountPrice || product.price);
  const activeStock = matchingVariant ? matchingVariant.stock : product.stock;

  const uniqueColors = Array.from(new Set(product.variants?.map(v => v.color).filter(Boolean) || []));
  const uniqueFabrics = Array.from(new Set(product.variants?.map(v => v.fabric).filter(Boolean) || []));
  const uniqueSizes = Array.from(new Set(product.variants?.map(v => v.size).filter(Boolean) || []));
  const sizesToDisplay = uniqueSizes.length > 0 ? uniqueSizes : product.sizes || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-20">
      
      {/* Editorial breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-neutral-400 font-sans">
        <Link to="/" className="hover:text-black">Studio</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/shop" className="hover:text-black">Catalog</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-500 font-medium">{product.name}</span>
      </div>

      {/* Main product display split screen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Image showcase with Zoom & thumb sliders */}
        <div className="space-y-4">
          
          {/* Main Display frame */}
          <div
            onMouseMove={handleZoomMove}
            onMouseLeave={handleZoomLeave}
            className="relative aspect-[3/4] bg-neutral-50 dark:bg-neutral-900 border border-[#ECECEC] dark:border-neutral-800 overflow-hidden cursor-crosshair group"
          >
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* Magnifier preview glass */}
            <div
              style={zoomStyle}
              className="absolute inset-0 pointer-events-none bg-no-repeat border border-[#D9C7A3] z-10 hidden md:block"
            />
          </div>

          {/* Thumbnail list */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 aspect-[3/4] border overflow-hidden transition-all duration-300 focus:outline-none ${
                    activeImage === img ? 'border-[#B68D40] scale-102' : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <img src={img} alt="Thumbnail view" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Video player loop */}
          {product.video && (
            <div className="relative aspect-[16/9] w-full border border-[#ECECEC] dark:border-neutral-800 bg-neutral-950 overflow-hidden mt-6">
              <video
                src={product.video}
                autoPlay
                muted={videoMuted}
                loop
                playsInline
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                <span className="text-[8px] tracking-[0.2em] font-sans font-bold uppercase text-white bg-black/45 backdrop-blur-md px-2.5 py-1">
                  COUTURE SILHOUETTE PREVIEW
                </span>
                
                {/* Mute button */}
                <button
                  onClick={() => setVideoMuted(!videoMuted)}
                  className="p-2 bg-black/45 backdrop-blur-md text-white rounded-full hover:bg-[#B68D40] transition-colors focus:outline-none"
                  aria-label={videoMuted ? "Unmute video" : "Mute video"}
                >
                  {videoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: details panel */}
        <div className="space-y-8 md:pl-6">
          
          {/* Header titles */}
          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#B68D40] font-sans font-semibold">
                {product.designer}
              </span>
              <h1 className="text-3xl font-serif font-light text-text-custom dark:text-primary uppercase tracking-wider leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating strip */}
            <div className="flex items-center gap-1.5">
              <div className="flex text-[#B68D40]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating) ? 'fill-[#B68D40]' : 'opacity-30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-sans text-neutral-500 uppercase tracking-wider">
                {product.rating} Rating ({reviews.length} Client Reviews)
              </span>
            </div>

            {/* Pricing */}
            <div className="flex items-center gap-4 font-sans text-xl pt-2">
              <span className="font-semibold text-neutral-900 dark:text-primary">
                ₹{activePrice.toLocaleString('en-IN')}
              </span>
              {!matchingVariant && product.discountPrice && (
                <span className="text-neutral-400 line-through text-sm">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <hr className="border-[#ECECEC] dark:border-neutral-800" />

          {/* Color pickers */}
          {uniqueColors.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] tracking-widest text-neutral-400 font-sans uppercase font-medium block">
                CHOOSE COLOR: <span className="text-neutral-800 dark:text-white font-bold">{selectedColor}</span>
              </span>
              <div className="flex flex-wrap gap-3">
                {uniqueColors.map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`w-7 h-7 rounded-full border-2 transition-all duration-300 ${
                      selectedColor === col ? 'border-[#B68D40] scale-110 shadow-md' : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                    style={{ backgroundColor: col.toLowerCase() }}
                    title={col}
                    aria-label={`Select color ${col}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Fabric choices */}
          {uniqueFabrics.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] tracking-widest text-neutral-400 font-sans uppercase font-medium block">
                CHOOSE WEAVE: <span className="text-neutral-800 dark:text-white font-bold">{selectedFabric}</span>
              </span>
              <div className="flex flex-wrap gap-2.5">
                {uniqueFabrics.map((fab) => (
                  <button
                    key={fab}
                    onClick={() => setSelectedFabric(fab)}
                    className={`px-4 py-2 border text-xs tracking-wider uppercase transition-all duration-300 font-sans focus:outline-none ${
                      selectedFabric === fab
                        ? 'border-[#B68D40] bg-[#B68D40] text-white shadow-sm'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-[#B68D40] text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {fab}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizing schedule */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-widest text-neutral-400 font-sans uppercase font-medium">
                CHOOSE FIT SIZE
              </span>
              
              {/* Size guide button */}
              <button
                onClick={() => setActiveTab("sizeguide")}
                className="text-[9px] uppercase tracking-widest text-[#B68D40] hover:text-black font-sans font-semibold flex items-center gap-1 focus:outline-none"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Guide</span>
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {sizesToDisplay.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-4.5 py-2 border text-xs tracking-wider uppercase transition-all duration-300 font-sans focus:outline-none ${
                    selectedSize === sz
                      ? 'border-[#B68D40] bg-[#B68D40] text-white shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-[#B68D40] text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity selector */}
          <div className="space-y-3">
            <span className="text-[10px] tracking-widest text-neutral-400 font-sans uppercase font-medium">
              QUANTITY
            </span>
            <div className="flex items-center border border-neutral-300 dark:border-neutral-700 bg-[#F8F6F2] dark:bg-neutral-800 w-28 justify-between">
              <button
                onClick={() => setQty(prev => Math.max(1, prev - 1))}
                className="px-3 py-2 text-sm text-neutral-500 hover:text-black focus:outline-none"
              >
                -
              </button>
              <span className="font-sans font-semibold text-xs text-[#181818] dark:text-[#F8F6F2]">{qty}</span>
              <button
                onClick={() => setQty(prev => prev + 1)}
                className="px-3 py-2 text-sm text-neutral-500 hover:text-black focus:outline-none"
              >
                +
              </button>
            </div>
          </div>

          {/* Checkout controls */}
          <div className="flex gap-4">
            {activeStock > 0 ? (
              <button
                onClick={handleAddToCart}
                className="flex-grow btn-luxury-solid py-4 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{added ? "ADDED TO COUTURE BAG" : "ADD TO COUTURE BAG"}</span>
              </button>
            ) : (
              <button
                disabled
                className="flex-grow py-4 bg-neutral-200 text-neutral-400 text-xs uppercase tracking-widest cursor-not-allowed font-sans text-center"
              >
                GARMENT SOLD OUT
              </button>
            )}
            
            <button
              onClick={() => toggleWishlist(product)}
              className="p-4 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-primary hover:border-[#B68D40] transition-colors focus:outline-none"
              aria-label="Wishlist toggle"
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-[#B68D40] text-[#B68D40]' : ''}`} />
            </button>
          </div>

          {/* Bespoke advisory banner */}
          {product.customizationAvailable && (
            <div className="bg-[#F8F6F2] dark:bg-neutral-900 border border-[#D9C7A3] p-4 space-y-2">
              <h5 className="text-[10px] font-sans font-semibold tracking-wider text-[#B68D40] uppercase">
                Bespoke Sizing & Styling Available
              </h5>
              <p className="text-[10px] font-sans text-neutral-500 leading-relaxed text-justify">
                This designer garment can be tailored according to your custom measurements. Access our custom draping request flow to submit styling notes.
              </p>
              <Link
                to="/customize"
                className="text-[9px] uppercase tracking-widest text-[#B68D40] hover:text-black transition-colors font-sans font-bold flex items-center gap-1"
              >
                <span>Request Custom Sizing</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Details tab selector */}
          <div className="space-y-4">
            <div className="flex border-b border-[#ECECEC] dark:border-neutral-800 text-[10px] font-sans font-semibold tracking-widest uppercase">
              {['description', 'details', 'sizeguide', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2.5 pr-5 border-b-2 -mb-0.5 transition-colors focus:outline-none ${
                    activeTab === tab
                      ? 'border-[#B68D40] text-[#B68D40]'
                      : 'border-transparent text-neutral-400 hover:text-black'
                  }`}
                >
                  {tab === 'sizeguide' ? 'Size Guide' : tab}
                </button>
              ))}
            </div>

            {/* Tab contents panel */}
            <div className="text-xs font-sans text-neutral-600 dark:text-neutral-300 leading-relaxed min-h-24">
              {activeTab === 'description' && (
                <div className="space-y-3">
                  <p>{product.description}</p>
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-[#B68D40] uppercase tracking-wider block mb-1">THE STORY</span>
                    <p className="italic">{product.story}</p>
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-3.5 uppercase tracking-wider text-[10px]">
                  <div>
                    <span className="text-neutral-400 block">Fabric composition:</span>
                    <span className="font-semibold text-neutral-800 dark:text-primary">{product.fabric}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Care guidelines:</span>
                    <span className="font-semibold text-neutral-800 dark:text-primary">{product.careInstructions}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Occasion code:</span>
                    <span className="font-semibold text-neutral-800 dark:text-primary">{product.occasion}</span>
                  </div>
                </div>
              )}

              {activeTab === 'sizeguide' && (
                <div className="space-y-4">
                  <p>Our tailoring works off luxury body fits. Sizing represents bust widths.</p>
                  <table className="w-full border-collapse border border-neutral-200 dark:border-neutral-800 text-left text-[10px] uppercase">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 font-semibold text-[#B68D40]">
                        <th className="p-2">SIZE</th>
                        <th className="p-2">BUST</th>
                        <th className="p-2">WAIST</th>
                        <th className="p-2">HIPS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-neutral-100 dark:border-neutral-800">
                        <td className="p-2 font-semibold">XS</td>
                        <td className="p-2">32 in</td>
                        <td className="p-2">26 in</td>
                        <td className="p-2">36 in</td>
                      </tr>
                      <tr className="border-b border-neutral-100 dark:border-neutral-800">
                        <td className="p-2 font-semibold">S</td>
                        <td className="p-2">34 in</td>
                        <td className="p-2">28 in</td>
                        <td className="p-2">38 in</td>
                      </tr>
                      <tr className="border-b border-neutral-100 dark:border-neutral-800">
                        <td className="p-2 font-semibold">M</td>
                        <td className="p-2">36 in</td>
                        <td className="p-2">30 in</td>
                        <td className="p-2">40 in</td>
                      </tr>
                      <tr className="border-b border-neutral-100 dark:border-neutral-800">
                        <td className="p-2 font-semibold">L</td>
                        <td className="p-2">38 in</td>
                        <td className="p-2">32 in</td>
                        <td className="p-2">42 in</td>
                      </tr>
                      <tr className="border-b border-neutral-100 dark:border-neutral-800">
                        <td className="p-2 font-semibold">XL</td>
                        <td className="p-2">40 in</td>
                        <td className="p-2">34 in</td>
                        <td className="p-2">44 in</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  {reviews.length > 0 ? (
                    reviews.map((rev) => (
                      <div key={rev.id} className="border-b border-[#ECECEC] dark:border-neutral-800 pb-3 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-neutral-800 dark:text-primary">{rev.userName}</span>
                          <span className="text-[8px] text-neutral-400">{new Date(rev.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex text-[#B68D40]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2.5 h-2.5 ${i < rev.userRating ? 'fill-[#B68D40]' : 'opacity-20'}`}
                            />
                          ))}
                        </div>
                        <p className="text-neutral-500 italic text-[11px] leading-relaxed">"{rev.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-neutral-400 italic">No client reviews registered for this item yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 2. Related Products */}
      {product.relatedProductsData && product.relatedProductsData.length > 0 && (
        <section className="space-y-10 border-t border-[#ECECEC] dark:border-neutral-800 pt-16">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#B68D40] font-sans font-semibold">COUTURE MATCHES</span>
            <h3 className="text-2xl font-serif font-light tracking-wide text-text-custom dark:text-primary uppercase">
              Related Garments
            </h3>
            <div className="w-12 h-0.5 bg-[#D9C7A3] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {product.relatedProductsData.slice(0, 4).map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Recently Viewed list */}
      {recentlyViewed.length > 0 && (
        <section className="space-y-10 border-t border-[#ECECEC] dark:border-neutral-800 pt-16">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#B68D40] font-sans font-semibold">VISUAL HISTORY</span>
            <h3 className="text-2xl font-serif font-light tracking-wide text-text-custom dark:text-primary uppercase">
              Recently Viewed
            </h3>
            <div className="w-12 h-0.5 bg-[#D9C7A3] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recentlyViewed.map((recentProduct) => (
              <ProductCard key={recentProduct.id} product={recentProduct} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
