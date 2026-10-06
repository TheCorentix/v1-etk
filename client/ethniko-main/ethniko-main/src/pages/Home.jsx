import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
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
import { lookbookService } from '../services/lookbookService';
import AutoCarousel from '../components/common/AutoCarousel';
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

const PROMISES = [
  { Icon: Gem, label: "Handcrafted Heritage", desc: "Finest quality, handpicked with care" },
  { Icon: Scissors, label: "Made To Measure", desc: "Tailored precisely, just for you" },
  { Icon: Truck, label: "Worldwide Shipping", desc: "Delivered across India & beyond" },
  { Icon: ShieldCheck, label: "Secure Checkout", desc: "100% secure & trusted payments" },
  { Icon: UserCheck, label: "Personal Stylist", desc: "Expert guidance for the perfect look" },
];

// Shown until real looks are added from the admin panel.
const FALLBACK_LOOKS = [
  { id: "las-1", title: "Royal Wedding Look", image: "https://images.unsplash.com/photo-1769500804057-ca1391bf4617?auto=format&fit=crop&w=500&q=80", video: "https://assets.mixkit.co/n0ttlreavgu2tlxt0tzegag43rxm" },
  { id: "las-2", title: "Mehendi Magic", image: "https://images.unsplash.com/photo-1645862755924-9f4e7f200b83?auto=format&fit=crop&w=500&q=80", video: "https://assets.mixkit.co/ocx5y8mq7bgfzf1k9ohlmou5gyv6" },
  { id: "las-3", title: "Pastel Perfection", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=500&q=80", video: "https://assets.mixkit.co/3y5ab0asbol20kyfjxbthw62d2js" },
  { id: "las-4", title: "Festive Glam", image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=500&q=80", video: "https://assets.mixkit.co/dyys30tgnmx8hvpu2z3i6r5jviuj" },
];

// Centered title with a gold ornament and an optional "view all" link.
function SectionHeading({ title, subtitle, to, linkLabel = 'View all', dark = false }) {
  return (
    <div className="text-center space-y-3 px-6 mb-8 md:mb-10">
      <h2 className={`text-2xl md:text-3xl font-serif tracking-[0.15em] uppercase ${dark ? 'text-white' : 'text-[#181818]'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-[11px] font-sans tracking-[0.2em] uppercase ${dark ? 'text-neutral-400' : 'text-[#6E6E6E]'}`}>
          {subtitle}
        </p>
      )}
      <div className="flex items-center justify-center gap-3">
        <span className="w-10 h-[1px] bg-[#B68D40]" />
        <span className="text-[10px] text-[#D4AF37] font-sans">✦</span>
        <span className="w-10 h-[1px] bg-[#B68D40]" />
      </div>
      {to && (
        <Link
          to={to}
          className="inline-block text-[10px] tracking-[0.25em] font-sans font-bold text-[#B68D40] hover:text-[#D4AF37] uppercase transition-colors"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

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
  const [testimonials, setTestimonials] = useState([]);
  const [looks, setLooks] = useState(FALLBACK_LOOKS);

  // Fetch looks added from the admin Lookbook manager (falls back to the sample looks)
  useEffect(() => {
    lookbookService.getLookbooks(1, 12)
      .then(({ items }) => {
        const real = items
          .filter((l) => l.videoUrl)
          .map((l) => ({ id: l.id, title: l.title, image: l.thumbnailUrl, video: l.videoUrl }));
        if (real.length > 0) setLooks(real);
      })
      .catch((err) => console.error('Error loading looks:', err));
  }, []);

  // Fetch customer testimonials managed from the admin panel
  useEffect(() => {
    homepageService.getTestimonials()
      .then((items) => setTestimonials(items.filter((t) => t.status === 'ACTIVE')))
      .catch((err) => console.error('Error loading testimonials:', err));
  }, []);

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
        const under10k = res.products.filter(p => p.price <= 10000).slice(0, 10);
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
      className="text-[#181818] min-h-screen overflow-x-clip bg-fixed bg-no-repeat bg-cover"
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

      {/* 2. Promise ticker */}
      <section className="w-full bg-[#181818] border-y border-[#B68D40]/30 py-5" aria-label="Our promises">
        <AutoCarousel speed={45} gap={56} arrows={false} label="Our promises">
          {PROMISES.map(({ Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-4 whitespace-nowrap">
              <Icon className="w-5 h-5 text-[#D4AF37] shrink-0" strokeWidth={1.5} />
              <div className="leading-tight">
                <p className="text-[10px] tracking-[0.2em] font-sans font-semibold uppercase text-[#F8F6F2]">{label}</p>
                <p className="text-[10px] font-sans text-neutral-400 mt-0.5">{desc}</p>
              </div>
              <span className="ml-10 text-[#B68D40] text-[10px]" aria-hidden="true">✦</span>
            </div>
          ))}
        </AutoCarousel>
      </section>

      {/* 3. Explore Our Collections */}
      <section className="pt-12 md:pt-16">
        <SectionHeading title="Explore Our Collections" subtitle="Find your festive favourite" />
        <AutoCarousel speed={35} gap={20} label="Collections">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.path}
              className="group relative shrink-0 w-[170px] sm:w-[200px] md:w-[230px] aspect-[3/4] overflow-hidden rounded-xl bg-[#FFFCF8] border border-[#E6DCCF] shadow-[0_4px_20px_-8px_rgba(24,24,24,0.12)] hover:shadow-[0_16px_40px_-12px_rgba(182,141,64,0.4)] hover:border-[#B68D40] transition-all duration-500"
            >
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#F3E9D8] to-[#E6DCCF]">
                <Gem className="w-7 h-7 text-[#B68D40]/50" strokeWidth={1.2} />
              </div>
              <img
                src={cat.image}
                alt={cat.name}
                draggable={false}
                onError={(e) => { e.currentTarget.style.opacity = '0'; }}
                className="relative w-full h-full object-cover saturate-[1.05] group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-5 inset-x-4 text-center text-white space-y-1.5">
                <h4 className="font-serif text-[12px] tracking-[0.15em] uppercase">{cat.name}</h4>
                <span className="text-[8px] tracking-[0.25em] font-sans text-neutral-300 group-hover:text-[#D4AF37] transition-colors block">
                  DISCOVER COLLECTION
                </span>
              </div>
            </Link>
          ))}
        </AutoCarousel>
      </section>

      {/* 4. Below ₹10K Wear */}
      {(loading || below10kProducts.length > 0) && (
        <section className="py-12 md:py-16">
          <SectionHeading
            title="Below ₹10K Wear"
            subtitle="Luxury that loves your budget"
            to="/shop?maxPrice=10000"
          />
          {loading ? (
            <div className="flex justify-center gap-5 px-6 overflow-hidden">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="shrink-0 w-[200px] sm:w-[230px] md:w-[250px] aspect-[3/4.6] rounded-lg bg-[#F3E9D8] animate-pulse" />
              ))}
            </div>
          ) : (
            <AutoCarousel speed={30} gap={20} label="Products under ten thousand rupees">
              {below10kProducts.map((p, idx) => (
                <div
                  key={p.id}
                  className="group relative shrink-0 w-[200px] sm:w-[230px] md:w-[250px] rounded-lg border border-[#E6DCCF] flex flex-col bg-[#FFFCF8] overflow-hidden shadow-[0_4px_16px_-10px_rgba(24,24,24,0.15)] hover:shadow-[0_14px_32px_-14px_rgba(182,141,64,0.4)] hover:border-[#B68D40] hover:-translate-y-1 transition-all duration-500"
                >
                  <Link to={`/product/${p.slug}`} className="relative aspect-[3/3.8] block bg-neutral-50 overflow-hidden">
                    {idx % 3 === 0 ? (
                      <span className="absolute top-3 left-3 bg-gradient-to-r from-[#B68D40] to-[#D4AF37] text-white text-[8px] font-sans font-bold tracking-[0.12em] px-2.5 py-1 rounded-sm z-10 shadow-sm">
                        NEW
                      </span>
                    ) : idx % 3 === 1 ? (
                      <span className="absolute top-3 left-3 bg-[#181818] text-[#D4AF37] text-[8px] font-sans font-bold tracking-[0.12em] px-2.5 py-1 rounded-sm z-10 shadow-sm">
                        BESTSELLER
                      </span>
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#F3E9D8] to-[#E6DCCF]">
                      <Gem className="w-6 h-6 text-[#B68D40]/50" strokeWidth={1.2} />
                    </div>
                    {p.images[0] && (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        draggable={false}
                        onError={(e) => { e.currentTarget.style.opacity = '0'; }}
                        className="relative w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                      />
                    )}
                  </Link>
                  <div className="p-4 space-y-2 border-t border-[#E6DCCF]">
                    <span className="text-[8px] uppercase tracking-[0.15em] text-[#6E6E6E] font-sans block">{p.designer || p.subcategory}</span>
                    <Link to={`/product/${p.slug}`} className="font-serif text-[11px] uppercase text-[#181818] hover:text-[#B68D40] block line-clamp-1 tracking-wide">
                      {p.name}
                    </Link>
                    <div className="flex justify-between items-center text-[11px] font-sans font-semibold pt-1">
                      <span className="text-[#B68D40]">
                        ₹{(p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price).toLocaleString('en-IN')}
                        {p.discountPrice && p.discountPrice < p.price && (
                          <span className="ml-1.5 text-[#6E6E6E] font-light line-through text-[9px]">₹{p.price.toLocaleString('en-IN')}</span>
                        )}
                      </span>
                      <span className="text-[#6E6E6E] font-light text-[9px] italic">{p.fabric}</span>
                    </div>
                  </div>
                </div>
              ))}
            </AutoCarousel>
          )}
        </section>
      )}

      {/* 5. Look & Shop */}
      <section className="py-12 md:py-16 bg-[#181818] border-y border-[#B68D40]/30">
        <SectionHeading
          dark
          title="Look & Shop"
          subtitle="Watch styles you love. Shop the look instantly."
          to="/look-and-shop"
          linkLabel="Watch all looks"
        />
        <AutoCarousel speed={35} gap={20} arrowTone="dark" label="Look and shop videos">
          {looks.map((lk) => {
            const isHovered = hoveredLookId === lk.id;
            return (
              <div
                key={lk.id}
                onClick={() => navigate(`/look-and-shop?look=${lk.id}`)}
                onMouseEnter={() => setHoveredLookId(lk.id)}
                onMouseLeave={() => setHoveredLookId(null)}
                className="group relative shrink-0 w-[200px] sm:w-[230px] md:w-[260px] aspect-[3/4.2] bg-[#222] rounded-lg border border-[#B68D40]/30 overflow-hidden cursor-pointer hover:border-[#D4AF37] hover:-translate-y-1 transition-all duration-500"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#181818]">
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
                  lk.image && (
                    <img
                      src={lk.image}
                      alt={lk.title}
                      draggable={false}
                      onError={(e) => { e.currentTarget.style.opacity = '0'; }}
                      className="relative w-full h-full object-cover saturate-[1.05] group-hover:scale-105 transition-all duration-700"
                    />
                  )
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/25 flex items-center justify-center pointer-events-none">
                  {!isHovered && (
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.35)] group-hover:scale-110 transition-transform duration-300">
                      <span className="text-[12px] text-white pl-0.5">▶</span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <h4 className="text-[11px] uppercase tracking-[0.12em] font-sans font-bold">{lk.title}</h4>
                  <span className="text-[8px] tracking-[0.25em] font-sans text-[#D4AF37] uppercase">Shop the look →</span>
                </div>
              </div>
            );
          })}
        </AutoCarousel>
      </section>

      {/* 6. Draped in Love — customer testimonials (managed in Admin → Draped in Love) */}
      {testimonials.length > 0 && (
        <section className="py-12 md:py-16">
          <SectionHeading title="Draped in Love" subtitle="Love notes from the ETNIKO family" />
          <AutoCarousel speed={28} gap={24} label="Customer love notes">
            {testimonials.map((t) => (
              <figure
                key={t.id}
                className="shrink-0 w-[290px] md:w-[360px] flex flex-col justify-between gap-6 rounded-xl bg-[#FFFCF8] border border-[#E6DCCF] p-7 shadow-[0_4px_20px_-8px_rgba(24,24,24,0.12)] hover:border-[#B68D40] hover:shadow-[0_16px_40px_-12px_rgba(182,141,64,0.35)] transition-all duration-500"
              >
                <div className="space-y-4">
                  <span className="block font-serif text-5xl leading-none text-[#D4AF37]/60" aria-hidden="true">“</span>
                  <div className="flex gap-0.5 text-[#B68D40]" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'fill-current' : 'opacity-25'}`} strokeWidth={1.5} />
                    ))}
                  </div>
                  <blockquote className="font-serif text-[15px] leading-relaxed text-[#3A3A3A] italic">
                    {t.review}
                  </blockquote>
                </div>
                <figcaption className="flex items-center gap-3 pt-5 border-t border-[#E6DCCF]">
                  {t.customerImageUrl ? (
                    <img src={t.customerImageUrl} alt="" draggable={false} className="w-10 h-10 rounded-full object-cover border border-[#E6DCCF]" />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B68D40] to-[#D4AF37] text-white font-serif text-sm flex items-center justify-center">
                      {(t.customerName || '?').trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="text-[10px] tracking-[0.18em] font-sans font-semibold uppercase text-[#181818]">
                    {t.customerName}
                  </span>
                </figcaption>
              </figure>
            ))}
          </AutoCarousel>
        </section>
      )}

    </div>
  );
}
