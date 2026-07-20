import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  VolumeX, 
  Volume2, 
  Heart, 
  ShoppingBag, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  Star,
  Scissors
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import QuickViewModal from '../components/common/QuickViewModal';
import redLehengaLook from '../assets/red_lehenga_look.png';
import { useLookbooks } from '../hooks/useLookbook';
import { productService } from '../services/productService';
import { useEffect } from 'react';

// Mock high-fidelity looks to match the screenshot exactly
const LOOKS_DATA = [
  {
    id: "look-1",
    title: "Blush Elegance",
    description: "Timeless saree look for weddings",
    duration: "0:32",
    tags: ["Saree", "Earrings"],
    videoUrl: "https://assets.mixkit.co/n0ttlreavgu2tlxt0tzegag43rxm",
    products: [
      {
        id: "lkp-1",
        name: "Blush Embroidered Saree",
        price: 18500,
        fabric: "Organza Silk",
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
        sizes: ["XS", "S", "M", "L", "XL"],
        stock: 5,
        description: "Intricately embroidered blush rose organza saree with hand-turned scalloped gota edges.",
        designer: "Niharika"
      },
      {
        id: "lkp-2",
        name: "Poiki Chandbali Earrings",
        price: 4950,
        fabric: "Gold Plated Kundan",
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80",
        sizes: ["One Size"],
        stock: 10,
        description: "Classic Hyderabad double-crescent chandbali earrings in gold plating and freshwater pearls.",
        designer: "Niharika Accessories"
      }
    ]
  },
  {
    id: "look-2",
    title: "Sunlit Grace",
    description: "Perfect for haldi & daytime events",
    duration: "0:28",
    tags: ["Anarkali", "Dupatta"],
    videoUrl: "https://assets.mixkit.co/ocx5y8mq7bgfzf1k9ohlmou5gyv6",
    products: [
      {
        id: "lkp-3",
        name: "Mustard Silk Anarkali",
        price: 16500,
        fabric: "Chanderi Silk",
        image: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=400&q=80",
        sizes: ["S", "M", "L"],
        stock: 4,
        description: "Mustard yellow traditional pleated Chanderi Anarkali with subtle gold block prints.",
        designer: "Niharika"
      }
    ]
  },
  {
    id: "look-3",
    title: "Royal Teal",
    description: "A modern regal affair",
    duration: "0:30",
    tags: ["Lehenga", "Necklace"],
    videoUrl: "https://assets.mixkit.co/3y5ab0asbol20kyfjxbthw62d2js",
    products: [
      {
        id: "lkp-4",
        name: "Teal Zardozi Lehenga",
        price: 36800,
        fabric: "Raw Silk",
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80",
        sizes: ["S", "M", "L"],
        stock: 2,
        description: "Stunning teal blue raw silk lehenga features detailed gold zardozi leaf work.",
        designer: "Niharika"
      },
      {
        id: "lkp-5",
        name: "Kundan Statement Necklace",
        price: 8950,
        fabric: "Kundan Gold",
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80",
        sizes: ["One Size"],
        stock: 3,
        description: "Heavy jadau kundan choker necklace with green enamel drops.",
        designer: "Niharika Accessories"
      }
    ]
  },
  {
    id: "look-4",
    title: "Classic Charm",
    description: "Gentlemen's festive edit",
    duration: "0:27",
    tags: ["Kurta", "Jacket"],
    videoUrl: "https://assets.mixkit.co/dyys30tgnmx8hvpu2z3i6r5jviuj",
    products: [
      {
        id: "lkp-6",
        name: "Beige Threadwork Kurta",
        price: 6450,
        fabric: "Tussar Silk",
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80",
        sizes: ["M", "L", "XL"],
        stock: 8,
        description: "Classic self-thread embroidered kurta in premium beige handloom silk.",
        designer: "Sabyasachi Edit"
      }
    ]
  },
  {
    id: "look-5",
    title: "Lilac Dream",
    description: "For receptions & celebrations",
    duration: "0:31",
    tags: ["Lehenga", "Maang Tikka"],
    videoUrl: "https://assets.mixkit.co/l4c6a4ovnkosfbggsvcvvnaap58m",
    products: [
      {
        id: "lkp-7",
        name: "Pearl Maang Tikka",
        price: 2450,
        fabric: "Faux Pearls",
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80",
        sizes: ["One Size"],
        stock: 12,
        description: "Delicate seed pearl clusters surrounding a central kundan stud.",
        designer: "Niharika Accessories"
      }
    ]
  },
  {
    id: "look-6",
    title: "Emerald Muse",
    description: "Rich, festive & unforgettable",
    duration: "0:29",
    tags: ["Saree", "Necklace"],
    videoUrl: "https://assets.mixkit.co/1d5iy6uzi6i42iw0icpmx3xuftx9",
    products: [
      {
        id: "lkp-8",
        name: "Emerald Green Kanjeevaram",
        price: 24500,
        fabric: "Kanjeevaram Silk",
        image: "https://images.unsplash.com/photo-1610030470298-4c5855797ee3?auto=format&fit=crop&w=400&q=80",
        sizes: ["One Size"],
        stock: 3,
        description: "Traditional pure mulberry silk Kanjeevaram saree in emerald green with solid zari borders.",
        designer: "Niharika"
      }
    ]
  }
];

export default function LookAndShop() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [activeLookIdx, setActiveLookIdx] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState(null);

  // Dynamic Lookbooks Integration
  const lookbooksQuery = useLookbooks(1, 12);
  const [liveLooks, setLiveLooks] = useState([]);

  useEffect(() => {
    if (lookbooksQuery.data?.items) {
      const fetchLookbookProducts = async () => {
        try {
          const mapped = await Promise.all(
            lookbooksQuery.data.items.map(async (look) => {
              const products = [];
              if (look.tags && Array.isArray(look.tags)) {
                for (const tag of look.tags) {
                  try {
                    const prod = await productService.getProductById(tag.productId);
                    if (prod) {
                      products.push({
                        id: prod.id,
                        name: prod.name,
                        price: prod.price / 100, // convert Paise to INR for UI!
                        fabric: prod.fabric || 'Premium Weave',
                        image: prod.images?.[0] || '',
                        sizes: prod.sizes || ['M'],
                        stock: prod.stock || 5,
                        description: prod.description || '',
                        designer: prod.designer || 'ETNIKO Edit',
                        x: tag.x,
                        y: tag.y,
                      });
                    }
                  } catch (e) {
                    console.error('Failed to load tagged product:', tag.productId);
                  }
                }
              }
              return {
                id: look.id,
                title: look.title,
                description: 'Editorial Video Look',
                duration: '0:30',
                tags: look.tags?.map((t) => t.productId) || [],
                videoUrl: look.videoUrl,
                products,
              };
            })
          );
          setLiveLooks(mapped);
        } catch (err) {
          console.error('Failed to load dynamic lookbooks:', err);
        }
      };
      fetchLookbookProducts();
    }
  }, [lookbooksQuery.data]);

  const combinedLooks = [...liveLooks, ...LOOKS_DATA];

  // References for video tag triggers
  const activeLook = combinedLooks[activeLookIdx] || LOOKS_DATA[0];

  const handleQuickAdd = (product) => {
    // Adapter to match standard product schema
    const standardProd = {
      id: product.id,
      name: product.name,
      price: product.price,
      images: [product.image],
      sizes: product.sizes,
      stock: product.stock,
      description: product.description,
      designer: product.designer,
      slug: product.id
    };
    addToCart(standardProd, product.sizes[0]);
  };

  const handleQuickView = (product) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      images: [product.image],
      sizes: product.sizes,
      stock: product.stock,
      description: product.description,
      designer: product.designer,
      slug: product.id,
      fabric: product.fabric
    });
    setQuickViewOpen(true);
  };

  return (
    <div
      className="text-[#181818] min-h-screen space-y-20 pb-16 bg-fixed bg-no-repeat bg-cover"
      style={{ background: "linear-gradient(180deg, #FBE7C6 0%, #F6EFE3 40%, #E9DCC4 100%)" }}
    >
      
      {/* SECTION 1: HERO BANNER */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-14 items-center pt-10">
        <div className="space-y-7">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#B68D40] font-sans font-bold block">
            Watch. Inspire. Shop.
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-light tracking-wide leading-[1.2] uppercase text-[#181818]">
            Looks You Love,<br />Pieces You Adore.
          </h1>
          <p className="text-xs font-sans text-[#6E6E6E] leading-relaxed max-w-md">
            Explore our handpicked looks styled by our designers. Tap on any product in the video to shop instantly.
          </p>
          <button
            onClick={() => {
              // Scroll to looks directory
              const target = document.getElementById("looks-directory");
              if (target) target.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-3.5 bg-transparent border border-[#B68D40] text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-[#181818] hover:bg-[#181818] hover:text-[#D4AF37] hover:border-[#181818] transition-all duration-300 flex items-center gap-3"
          >
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[9px] pl-0.5">▶</span>
            <span>How It Works</span>
          </button>
        </div>

        <div className="relative aspect-[16/10] w-full rounded-xl border border-[#E6DCCF] bg-[#FFFCF8] overflow-hidden shadow-[0_16px_40px_-16px_rgba(24,24,24,0.25)]">
          <img
            src={redLehengaLook}
            alt="Red Lehenga Editorial Look"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
      </section>

      {/* SECTION 2: WATCH OUR LOOKS DIRECTORY */}
      <section id="looks-directory" className="max-w-7xl mx-auto px-6 space-y-10 pt-4">
        <div className="text-center space-y-3">
          <span className="text-[9px] uppercase tracking-[0.3em] text-[#B68D40] font-sans font-bold">Watch Our Looks</span>
          <h2 className="text-2xl md:text-3xl font-serif tracking-[0.1em] uppercase text-[#181818]">Scroll, Watch &amp; Shop the Entire Look</h2>
          <div className="flex items-center justify-center gap-3">
            <span className="w-10 h-[1px] bg-[#B68D40]" />
            <span className="text-[10px] text-[#D4AF37] font-sans">✦</span>
            <span className="w-10 h-[1px] bg-[#B68D40]" />
          </div>
        </div>

        {/* Horizontal scroll grid of looks */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {combinedLooks.map((look, idx) => {
            const isSelected = idx === activeLookIdx;
            const isPlaying = playingVideoId === look.id;
            return (
              <div
                key={look.id}
                onClick={() => {
                  setActiveLookIdx(idx);
                  setPlayingVideoId(isPlaying ? null : look.id);
                }}
                className={`group cursor-pointer space-y-3.5 ${
                  isSelected ? 'scale-[1.03]' : 'opacity-85 hover:opacity-100'
                } transition-all duration-300`}
              >
                {/* Video container */}
                <div className={`relative aspect-[3/4] rounded-lg bg-[#FFFCF8] border overflow-hidden transition-all duration-300 ${
                  isSelected
                    ? 'border-[#B68D40] shadow-[0_14px_32px_-14px_rgba(182,141,64,0.45)]'
                    : 'border-[#E6DCCF] shadow-[0_4px_16px_-10px_rgba(24,24,24,0.12)] group-hover:border-[#B68D40]'
                }`}>
                  {isPlaying ? (
                    <video
                      src={look.videoUrl}
                      autoPlay loop muted playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={look.products?.[0]?.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80"}
                      alt={look.title}
                      className="w-full h-full object-cover saturate-[1.05] group-hover:scale-105 transition-transform duration-700"
                    />
                  )}

                  {/* play button overlay */}
                  {!isPlaying && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.25)] group-hover:scale-110 transition-transform duration-300">
                        <span className="text-[11px] text-white pl-0.5">▶</span>
                      </div>
                    </div>
                  )}

                  {/* duration badge */}
                  <span className="absolute top-2.5 right-2.5 bg-[#181818]/80 text-[#D4AF37] text-[8px] font-sans font-semibold tracking-wider px-2 py-1 rounded-sm">
                    {look.duration}
                  </span>

                  {/* bottom tag pills */}
                  <div className="absolute bottom-2.5 inset-x-2.5 flex flex-wrap gap-1">
                    {look.tags.map(t => (
                      <span key={t} className="bg-white/85 backdrop-blur-sm text-[#181818] text-[8px] font-sans font-semibold px-2 py-0.5 uppercase tracking-wider rounded-sm">
                        + {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Text details */}
                <div className="space-y-1">
                  <h4 className={`text-[10.5px] uppercase font-serif tracking-[0.1em] ${
                    isSelected ? 'text-[#B68D40]' : 'text-[#181818]'
                  }`}>
                    {look.title}
                  </h4>
                  <p className="text-[9px] font-sans text-[#6E6E6E] leading-snug line-clamp-1">{look.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: SHOP THE LOOK */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 pt-4">
        
        {/* Left Column Description */}
        <div className="lg:col-span-3 space-y-5">
          <h3 className="font-serif text-xl tracking-[0.1em] text-[#181818] uppercase">Shop the Look</h3>
          <p className="text-xs font-sans text-[#6E6E6E] leading-relaxed">
            Curated pieces from the video you just watched.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3.5 bg-transparent border border-[#B68D40] text-[9.5px] font-sans font-bold tracking-[0.2em] uppercase text-[#181818] hover:bg-[#181818] hover:text-[#D4AF37] hover:border-[#181818] transition-all duration-300 w-full lg:w-auto"
          >
            View All Products
          </button>
        </div>

        {/* Middle Column Product Shelf */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-5">
          {activeLook.products.map((p) => {
            const inWish = isInWishlist(p.id);
            return (
              <div
                key={p.id}
                className="group relative rounded-lg border border-[#E6DCCF] flex flex-col justify-between h-full bg-[#FFFCF8] overflow-hidden shadow-[0_4px_16px_-10px_rgba(24,24,24,0.15)] hover:shadow-[0_14px_32px_-14px_rgba(182,141,64,0.4)] hover:border-[#B68D40] hover:-translate-y-1 transition-all duration-500"
              >
                <div className="relative aspect-[3/3.8] block bg-neutral-50 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#F3E9D8] to-[#E6DCCF]">
                    <Heart className="w-6 h-6 text-[#B68D40]/50" strokeWidth={1.2} />
                  </div>
                  <img
                    src={p.image}
                    alt={p.name}
                    onError={(e) => { e.currentTarget.style.opacity = '0'; }}
                    className="relative w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  />
                  {/* wishlist toggle */}
                  <button
                    onClick={() => toggleWishlist({ id: p.id, name: p.name, price: p.price, images: [p.image] })}
                    className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-[#181818] hover:text-[#B68D40] transition-colors focus:outline-none z-10 shadow-sm"
                  >
                    <Heart className={`w-3.5 h-3.5 ${inWish ? 'fill-[#B68D40] text-[#B68D40]' : ''}`} />
                  </button>
                </div>
                <div className="p-4 space-y-2 border-t border-[#E6DCCF]">
                  <span className="text-[8px] uppercase tracking-[0.15em] text-[#6E6E6E] font-sans block">{p.designer}</span>
                  <h4 className="font-serif text-[11px] uppercase text-[#181818] line-clamp-1 tracking-wide">
                    {p.name}
                  </h4>
                  <div className="flex justify-between items-center text-[11px] font-sans font-semibold pt-1">
                    <span className="text-[#B68D40]">₹{p.price.toLocaleString('en-IN')}</span>
                    <button
                      onClick={() => handleQuickAdd(p)}
                      className="p-1 text-[#181818] hover:text-[#B68D40] transition-colors"
                      aria-label="Add to bag"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column Promo Card */}
        <div className="lg:col-span-3 bg-[#FFFDFC] rounded-lg border border-[#E6DCCF] p-7 flex flex-col justify-between items-center text-center space-y-7 shadow-[0_4px_16px_-10px_rgba(24,24,24,0.12)]">
          <div className="space-y-2">
            <h3 className="font-serif text-xl tracking-[0.08em] text-[#181818] uppercase">Love a Look?</h3>
            <p className="text-[11px] font-sans text-[#6E6E6E] leading-relaxed">
              Get it customised just for you.
            </p>
          </div>

          <div className="w-full aspect-[4/3] rounded-lg bg-neutral-100 overflow-hidden border border-[#E6DCCF]">
            <img
              src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80"
              alt="Tailor consultation detail"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-full space-y-3.5">
            <button
              onClick={() => navigate('/customize')}
              className="w-full py-3.5 bg-[#181818] border border-[#B68D40] text-[#D4AF37] hover:bg-[#B68D40] hover:text-[#181818] text-[9.5px] font-sans font-bold tracking-[0.2em] uppercase transition-all duration-300"
            >
              Request Customisation
            </button>
            <a
              href="https://wa.me/919830012345"
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-1.5 text-[10px] font-sans font-bold text-[#3E7C59] hover:text-[#B68D40] transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Chat with our stylist</span>
            </a>
          </div>
        </div>

      </section>

      {/* SECTION 4: VALUE PROPOSITIONS FOOTER BAR */}
      <section className="w-full bg-[#FFFDFC] border-y border-[#E6DCCF] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { Icon: Sparkles, label: "Handpicked Looks", desc: "Curated by our in-house designers" },
              { Icon: Star, label: "Premium Quality", desc: "Finest fabrics & craftsmanship" },
              { Icon: Scissors, label: "Customisation Available", desc: "Made just for you" },
              { Icon: ShieldCheck, label: "Secure Shopping", desc: "Safe & easy checkout" },
            ].map(({ Icon, label, desc }) => (
              <div
                key={label}
                className="group flex flex-col items-center px-4 py-5 space-y-3 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-15px_rgba(182,141,64,0.35)]"
              >
                <Icon className="w-5 h-5 text-[#B68D40] group-hover:text-[#D4AF37] transition-colors duration-300" strokeWidth={1.5} />
                <h4 className="text-[10px] tracking-[0.18em] font-sans font-semibold uppercase text-[#181818]">{label}</h4>
                <p className="text-[10px] font-sans text-[#6E6E6E] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewOpen && selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          isOpen={quickViewOpen}
          onClose={() => {
            setQuickViewOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}

    </div>
  );
}