import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Heart, 
  ShoppingBag, 
  Eye, 
  ArrowRight,
  Scissors,
  Truck,
  ShieldCheck,
  UserCheck,
  Star,
  Gem
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../services/productService';
import { homepageService } from '../services/homepageService';
import { mockVideos } from '../mock/videos';
import greenLehengaHero from '../assets/green_lehenga_hero.png';
import ivorySareeLook from '../assets/ivory_saree_look.png';
import luxuryHero3 from "../assets/hero_4.png";

// Consistent editorial collection imagery
const EXPLORE_CATEGORIES = [
  {
    name: "SAREES",
    image: "https://images.unsplash.com/photo-1769500804057-ca1391bf4617?auto=format&fit=crop&w=800&q=80",
    path: "/shop?category=WOMEN&subcategory=Sarees"
  },
  {
    name: "LEHENGAS",
    image: "https://images.unsplash.com/photo-1645862755924-9f4e7f200b83?auto=format&fit=crop&w=800&q=80",
    path: "/shop?category=WOMEN&subcategory=Lehengas"
  },
  {
    name: "ANARKALIS",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    path: "/shop?category=WOMEN&subcategory=Anarkalis"
  },
  {
    name: "KIDS ETHNIC",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    path: "/shop?category=KIDS"
  },
  {
    name: "INDO-WESTERN",
    image: "https://images.unsplash.com/photo-1741847639057-b51a25d42892?auto=format&fit=crop&w=800&q=80",
    path: "/shop?category=WOMEN&subcategory=Indo-Western"
  },
  {
    name: "PRE-DRAPED SAREES",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
    path: "/shop?category=WOMEN&subcategory=Sarees"
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [below10kProducts, setBelow10kProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredLookId, setHoveredLookId] = useState(null);

  // Hero carousel details (default static fallback)
  const [heroSlides, setHeroSlides] = useState([
    {
      image: greenLehengaHero,
      title: "Timeless Heritage.\nModern Elegance.",
      subtitle: "Exquisite ethnic wear crafted for every celebration and every you.",
      position: "center center",
    },
    {
      image: ivorySareeLook,
      title: "Handspun Heritage.\nCustom Fits.",
      subtitle: "Celebrating standard curves with direct waist-rise hook adjustments.",
      position: "50% 20%",
    },
    {
      image: luxuryHero3,
      title: "Banaras & Chanderi.\nDirect to Wardrobe.",
      subtitle: "Pure handlooms straight from pit looms to boutique custom boxes.",
      position: "80% center",
    }
  ]);

  const [categories, setCategories] = useState(EXPLORE_CATEGORIES);

  // Fetch dynamic hero slider banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const slides = await homepageService.getHeroSlides();
        if (slides && slides.length > 0) {
          const activeSlides = slides
            .filter(s => s.status !== 'DELETED' && s.status !== 'ARCHIVED')
            .map(s => ({
              image: s.imageUrl,
              title: s.heading,
              subtitle: s.subtitle,
              position: s.alignment === 'center' ? 'center center' : s.alignment === 'left' ? 'left center' : 'right center'
            }));
          if (activeSlides.length > 0) {
            setHeroSlides(activeSlides);
          }
        }
      } catch (err) {
        console.error('Error loading dynamic banners:', err);
      }
    };
    fetchBanners();
  }, []);

  // Fetch dynamic categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await productService.getCategories();
        if (cats && cats.length > 0) {
          const activeCats = cats
            .filter(c => c.status === 'ACTIVE')
            .map(c => ({
              name: c.name,
              image: c.coverImageUrl,
              path: `/shop?category=${c.name}`
            }));
          if (activeCats.length > 0) {
            setCategories(activeCats);
          }
        }
      } catch (err) {
        console.error('Error loading dynamic categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Auto scroll slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Fetch products under 10k
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({ page: 1, limit: 12 });
        // Filter products priced under or equal to ₹10k
        const under10k = res.products.filter(p => p.price <= 10000).slice(0, 4);
        setBelow10kProducts(under10k);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handlePrevHero = () => {
    setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextHero = () => {
    setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  };

  return (
    <div
      className="text-[#181818] min-h-screen space-y-20 pb-24 bg-fixed bg-no-repeat bg-cover"
      style={{ background: "linear-gradient(180deg, #FBE7C6 0%, #F6EFE3 40%, #E9DCC4 100%)" }}
    >
      
      {/* 1. Hero Carousel */}
      <section className="relative h-[70vh] md:h-[80vh] w-full bg-[#181818] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 w-full h-full"
          >
            <img
  src={heroSlides[currentSlide].image}
  alt="Luxury Editorial Lookbook"
  className="w-full h-full object-cover"
  style={{
    objectPosition: heroSlides[currentSlide].position,
  }}
/>
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, rgba(0,0,0,.82) 0%, rgba(0,0,0,.45) 45%, rgba(0,0,0,.08) 100%)"
              }}
            />

            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-20 max-w-4xl z-10 text-white">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl md:text-7xl font-serif font-light tracking-wide leading-[1.15] whitespace-pre-line"
              >
                {heroSlides[currentSlide].title}
              </motion.h1>

              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 0.9 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-xs md:text-sm font-sans font-light tracking-[0.08em] mt-6 max-w-xl text-neutral-200"
              >
                {heroSlides[currentSlide].subtitle}
              </motion.p>

              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mt-10 flex flex-wrap gap-4"
              >
                <button
                  onClick={() => navigate('/shop')}
                  className="px-10 py-4 bg-[#181818] border border-[#B68D40] text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-[#D4AF37] hover:bg-[#B68D40] hover:text-[#181818] transition-all duration-300"
                >
                  Shop Collection
                </button>
                <button
                  onClick={() => navigate('/look-and-shop')}
                  className="px-10 py-4 bg-transparent border border-[#B68D40] text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-white hover:bg-white hover:text-[#181818] transition-all duration-300 flex items-center gap-3"
                >
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[9px] pl-0.5">▶</span>
                  <span>Look &amp; Shop</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel arrows */}
        <button
          onClick={handlePrevHero}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full border border-white/25 text-white/70 hover:text-[#181818] hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-300 z-20"
          aria-label="Prev Hero Banner"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNextHero}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full border border-white/25 text-white/70 hover:text-[#181818] hover:bg-[#D4AF37] hover:border-[#D4AF37] transition-all duration-300 z-20"
          aria-label="Next Hero Banner"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* progress dots */}
        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full border border-[#D4AF37] transition-all duration-300 ${
                currentSlide === idx ? 'bg-[#D4AF37]' : 'bg-transparent'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. Value Proposition bar */}
      <section className="w-full bg-[#FFFDFC] py-14 border-y border-[#E6DCCF]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {[
              { Icon: Gem, label: "Handcrafted Heritage", desc: "Finest quality, handpicked with care" },
              { Icon: Scissors, label: "Made To Measure", desc: "Tailored precisely, just for you" },
              { Icon: Truck, label: "Worldwide Shipping", desc: "Delivered across India & beyond" },
              { Icon: ShieldCheck, label: "Secure Checkout", desc: "100% secure & trusted payments" },
              { Icon: UserCheck, label: "Personal Stylist", desc: "Expert guidance for the perfect look" },
            ].map(({ Icon, label, desc }) => (
              <div
                key={label}
                className="group flex flex-col items-center px-4 py-6 space-y-3 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-15px_rgba(182,141,64,0.35)]"
              >
                <Icon className="w-6 h-6 text-[#B68D40] group-hover:text-[#D4AF37] transition-colors duration-300" strokeWidth={1.5} />
                <h4 className="text-[10px] tracking-[0.18em] font-sans font-semibold uppercase text-[#181818]">{label}</h4>
                <p className="text-[10px] font-sans text-[#6E6E6E] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Explore Our Collections */}
      <section className="py-20">
  <div className="max-w-7xl mx-auto px-6 space-y-14">

    <div className="text-center space-y-4">
      <h2 className="text-2xl md:text-3xl font-serif tracking-[0.15em] text-[#181818] uppercase">
        Explore Our Collections
      </h2>

      <div className="flex items-center justify-center gap-3">
        <span className="w-10 h-[1px] bg-[#B68D40]" />
        <span className="text-[10px] text-[#D4AF37] font-sans">✦</span>
        <span className="w-10 h-[1px] bg-[#B68D40]" />
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
      {categories.map((cat) => (
        <Link
          key={cat.name}
          to={cat.path}
          className="group aspect-[3/4] relative overflow-hidden rounded-xl bg-[#FFFCF8] border border-[#E6DCCF] shadow-[0_4px_20px_-8px_rgba(24,24,24,0.12)] hover:shadow-[0_16px_40px_-12px_rgba(182,141,64,0.4)] hover:border-[#B68D40] transition-all duration-500"
        >
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#F3E9D8] to-[#E6DCCF]">
            <Gem className="w-7 h-7 text-[#B68D40]/50" strokeWidth={1.2} />
          </div>
          <img
            src={cat.image}
            alt={cat.name}
            onError={(e) => { e.currentTarget.style.opacity = '0'; }}
            className="relative w-full h-full object-cover saturate-[1.05] group-hover:scale-110 transition-transform duration-700 ease-out"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

          <div className="absolute bottom-5 inset-x-4 text-center text-white space-y-1.5">
            <h4 className="font-serif text-[12px] tracking-[0.15em] uppercase">
              {cat.name}
            </h4>

            <span className="text-[8px] tracking-[0.25em] font-sans text-neutral-300 group-hover:text-[#D4AF37] transition-colors block">
              DISCOVER COLLECTION
            </span>
          </div>
        </Link>
      ))}
    </div>

  </div>
</section>

      {/* 4. Double Column Grid: BELOW 10K WEAR & LOOK & SHOP */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 pt-6">
        
        {/* Left Column: Below 10k Wear */}
        <div className="space-y-7">
          <div className="flex justify-between items-end border-b border-[#E6DCCF] pb-4">
            <h3 className="font-serif text-xl tracking-[0.1em] text-[#181818] uppercase">Below ₹10K Wear</h3>
            <Link to="/shop?maxPrice=10000" className="text-[9px] tracking-[0.2em] font-sans font-bold text-[#B68D40] hover:text-[#C89C4A] uppercase transition-colors">
              VIEW ALL
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {below10kProducts.map((p, idx) => (
              <div
                key={p.id}
                className="group relative rounded-lg border border-[#E6DCCF] flex flex-col justify-between h-full bg-[#FFFCF8] overflow-hidden shadow-[0_4px_16px_-10px_rgba(24,24,24,0.15)] hover:shadow-[0_14px_32px_-14px_rgba(182,141,64,0.4)] hover:border-[#B68D40] hover:-translate-y-1 transition-all duration-500"
              >
                <Link to={`/product/${p.slug}`} className="relative aspect-[3/3.8] block bg-neutral-50 overflow-hidden">
                  {idx % 2 === 0 ? (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-[#B68D40] to-[#D4AF37] text-white text-[8px] font-sans font-bold tracking-[0.12em] px-2.5 py-1 rounded-sm z-10 shadow-sm">
                      NEW
                    </span>
                  ) : idx === 1 ? (
                    <span className="absolute top-3 left-3 bg-[#181818] text-[#D4AF37] text-[8px] font-sans font-bold tracking-[0.12em] px-2.5 py-1 rounded-sm z-10 shadow-sm">
                      BESTSELLER
                    </span>
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#F3E9D8] to-[#E6DCCF]">
                    <Gem className="w-6 h-6 text-[#B68D40]/50" strokeWidth={1.2} />
                  </div>
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    onError={(e) => { e.currentTarget.style.opacity = '0'; }}
                    className="relative w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  />
                </Link>
                <div className="p-4 space-y-2 border-t border-[#E6DCCF]">
                  <span className="text-[8px] uppercase tracking-[0.15em] text-[#6E6E6E] font-sans block">{p.designer}</span>
                  <Link to={`/product/${p.slug}`} className="font-serif text-[11px] uppercase text-[#181818] hover:text-[#B68D40] block line-clamp-1 tracking-wide">
                    {p.name}
                  </Link>
                  <div className="flex justify-between items-center text-[11px] font-sans font-semibold pt-1">
                    <span className="text-[#B68D40]">₹{p.price.toLocaleString('en-IN')}</span>
                    <span className="text-[#6E6E6E] font-light text-[9px] italic">{p.fabric}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Look & Shop */}
        <div className="space-y-7">
          <div className="flex justify-between items-end border-b border-[#E6DCCF] pb-4">
            <div className="space-y-1">
              <h3 className="font-serif text-xl tracking-[0.1em] text-[#181818] uppercase">Look &amp; Shop</h3>
              <p className="text-[10px] font-sans text-[#6E6E6E]">Watch styles you love. Shop the look instantly.</p>
            </div>
            <Link to="/look-and-shop" className="text-[9px] tracking-[0.2em] font-sans font-bold text-[#B68D40] hover:text-[#C89C4A] uppercase transition-colors">
              VIEW ALL
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {[
              { id: "las-1", title: "Royal Wedding Look", image: "https://images.unsplash.com/photo-1769500804057-ca1391bf4617?auto=format&fit=crop&w=500&q=80", video: "https://assets.mixkit.co/n0ttlreavgu2tlxt0tzegag43rxm" },
              { id: "las-2", title: "Mehendi Magic", image: "https://images.unsplash.com/photo-1645862755924-9f4e7f200b83?auto=format&fit=crop&w=500&q=80", video: "https://assets.mixkit.co/ocx5y8mq7bgfzf1k9ohlmou5gyv6" },
              { id: "las-3", title: "Pastel Perfection", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80", video: "https://assets.mixkit.co/3y5ab0asbol20kyfjxbthw62d2js" },
              { id: "las-4", title: "Festive Glam", image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=500&q=80", video: "https://assets.mixkit.co/dyys30tgnmx8hvpu2z3i6r5jviuj" }
            ].map((lk) => {
              const isHovered = hoveredLookId === lk.id;
              return (
                <div
                  key={lk.id}
                  onClick={() => navigate(`/look-and-shop?look=${lk.id}`)}
                  onMouseEnter={() => setHoveredLookId(lk.id)}
                  onMouseLeave={() => setHoveredLookId(null)}
                  className="group relative aspect-[3.2/2.1] bg-[#FFFCF8] rounded-lg border border-[#E6DCCF] overflow-hidden cursor-pointer shadow-[0_4px_16px_-10px_rgba(24,24,24,0.15)] hover:shadow-[0_14px_32px_-14px_rgba(182,141,64,0.4)] hover:border-[#B68D40] hover:-translate-y-1 transition-all duration-500"
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#F3E9D8] to-[#E6DCCF]">
                    <Gem className="w-6 h-6 text-[#B68D40]/50" strokeWidth={1.2} />
                  </div>
                  {isHovered ? (
                    <video
                      src={lk.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="relative w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={lk.image}
                      alt={lk.title}
                      onError={(e) => { e.currentTarget.style.opacity = '0'; }}
                      className="relative w-full h-full object-cover saturate-[1.05] group-hover:scale-105 transition-all duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20 flex items-center justify-center pointer-events-none">
                    {!isHovered && (
                      <div className="w-11 h-11 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.25)] group-hover:scale-110 transition-transform duration-300">
                        <span className="text-[11px] text-white pl-0.5">▶</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-4 text-white">
                    <h4 className="text-[10px] uppercase tracking-[0.12em] font-sans font-bold">{lk.title}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </section>

    </div>
  );
}