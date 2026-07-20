import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Heart, ShoppingBag, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSearch } from '../../context/SearchContext';
import { productService } from '../../services/productService';

import menSherwaniSun from '../../assets/men_sherwani_sun.png';
import womenMaroonLehenga from '../../assets/women_maroon_lehenga.png';
import kidsEthnicWear from '../../assets/kids_ethnic_wear.png';
import coupleWeddingIvory from '../../assets/couple_wedding_ivory.png';
import etnikoLogo from '../../assets/etniko_logo.png';

const logoAsset = etnikoLogo;

export default function Navbar({ onOpenCart }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const { pathname } = useLocation();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { openSearch } = useSearch();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await productService.getPublicSettings();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Hide-on-scroll-down / show-on-scroll-up, mobile only
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY < 60) {
          // always show near the top of the page
          setShowNavbar(true);
        } else if (currentScrollY > lastScrollY + 5) {
          // scrolling down
          setShowNavbar(false);
          setMobileMenuOpen(false); // close drawer so it can't get stuck offscreen
        } else if (currentScrollY < lastScrollY - 5) {
          // scrolling up
          setShowNavbar(true);
        }

        setLastScrollY(currentScrollY);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShowMegaMenu(false);
    setMobileShopOpen(false);
  }, [pathname]);

  // Fix #12: close menus on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setShowMegaMenu(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Fix #3: close drawer whenever a mobile link is tapped
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Fix #2: shared active-state class helper for mobile links
  const mobileLinkClass = (path) =>
    `hover:text-[#B68D40] transition-colors ${
      pathname === path ? 'text-[#B68D40]' : 'text-[#181818] dark:text-[#F8F6F2]'
    }`;

  return (
    <>
      <header
        className={`w-full bg-[#F8F6F2] dark:bg-[#181818] border-b border-[#ECECEC] dark:border-neutral-800 text-[#181818] dark:text-[#F8F6F2] sticky top-0 z-40 transition-colors transition-transform duration-300 ease-out md:translate-y-0 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col items-center relative">

          {/* MOBILE HEADER (md:hidden) */}
          <div className="w-full h-16 flex md:hidden items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 focus:outline-none hover:text-[#B68D40]"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Centered Mobile Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
              <Link to="/" className="flex items-center">
                <img
                  src={settings?.logoUrl || logoAsset}
                  alt="Etniko"
                  className="h-11 w-auto object-contain"
                  loading="lazy"
                />
              </Link>
            </div>

            {/* Fix #15: search + cart on mobile */}
            <div className="flex items-center space-x-1">
              <button
                onClick={openSearch}
                className="p-2 focus:outline-none hover:text-[#B68D40]"
                aria-label="Open search modal"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={onOpenCart}
                className="p-2 -mr-2 focus:outline-none hover:text-[#B68D40] relative"
                aria-label="Open cart mobile"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#B68D40] text-white text-[7px] font-sans font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* DESKTOP ROW 1: Centered Logo + Right Action Icons */}
          <div className="hidden md:flex w-full items-center justify-between pt-4 pb-2 relative min-h-[110px]">
            <div className="w-44" />

            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
              <Link to="/" className="flex items-center select-none text-center transform hover:scale-[1.01] transition-transform">
                <img
                  src={settings?.logoUrl || logoAsset}
                  alt="Etniko - Designer Boutique"
                  className="h-[92px] w-auto object-contain"
                  loading="lazy"
                />
              </Link>
            </div>

            {/* Fix #9: larger click targets (p-1.5 -> p-2) */}
            <div className="flex items-center space-x-2.5 sm:space-x-3.5 w-44 justify-end z-10 text-neutral-600 dark:text-neutral-300">
              <button
                onClick={openSearch}
                className="p-2 hover:text-[#B68D40] transition-colors focus:outline-none"
                aria-label="Open search modal"
              >
                <Search className="w-4 h-4" />
              </button>

              <Link
                to="/wishlist"
                className="p-2 hover:text-[#B68D40] transition-colors relative"
                aria-label="Go to wishlist"
              >
                <Heart className="w-4 h-4" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#B68D40] rounded-full" />
                )}
              </Link>

              <button
                onClick={onOpenCart}
                className="p-2 hover:text-[#B68D40] transition-colors relative focus:outline-none"
                aria-label="Open cart bag"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#B68D40] text-white text-[8px] font-sans font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <Link
                to="/profile"
                className="p-2 hover:text-[#B68D40] transition-colors"
                aria-label="Go to profile"
              >
                <User className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* DESKTOP ROW 2: Centered Navigation Menu */}
          <nav className="hidden md:flex w-full items-center justify-center space-x-5 text-[10px] tracking-[0.2em] font-sans font-semibold text-neutral-500 uppercase pb-6">
            <Link
              to="/"
              className={`transition-colors duration-200 ${pathname === '/' ? 'text-[#B68D40]' : 'hover:text-[#B68D40]'}`}
            >
              HOME
            </Link>
            <span className="text-neutral-300 font-light select-none">|</span>

            <Link
              to="/look-and-shop"
              className={`transition-colors duration-200 ${pathname === '/look-and-shop' ? 'text-[#B68D40]' : 'hover:text-[#B68D40]'}`}
            >
              LOOK & SHOP
            </Link>
            <span className="text-neutral-300 font-light select-none">|</span>

            {/* Fix #4: mega-menu open/close scoped to trigger + panel, not the whole header */}
            <div
              onMouseEnter={() => setShowMegaMenu(true)}
              onMouseLeave={() => setShowMegaMenu(false)}
              className="relative py-1"
            >
              <Link
                to="/shop"
                className={`transition-colors duration-200 flex items-center gap-1 ${pathname.startsWith('/shop') ? 'text-[#B68D40]' : 'hover:text-[#B68D40]'}`}
              >
                <span>SHOP</span>
                {showMegaMenu ? <ChevronUp size={12} className="text-neutral-400" /> : <ChevronDown size={12} className="text-neutral-400" />}
              </Link>

              {/* DESKTOP MEGA DROP-DOWN MENU OVERLAY (moved inside the hover-scoped wrapper) */}
              {showMegaMenu && (
                <div className="fixed left-0 right-0 top-[8.75rem] bg-[#FFFDFC] text-[#181818] border border-[#E6DCCF] rounded-b-2xl shadow-xl p-8 z-50 transition-opacity duration-300 ease-out">
                  <div className="max-w-[1440px] mx-auto grid grid-cols-12 gap-8">

                    {/* Column 1: MEN */}
                    <div className="col-span-3 space-y-6 flex flex-col justify-between text-left">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-[#E6DCCF] pb-2">
                          <svg className="w-5 h-5 text-[#B68D40]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M6 3L12 8L18 3M12 8V21M6 3H9M18 3H15" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4 8H20" strokeLinecap="round"/>
                          </svg>
                          <h3 className="font-serif text-sm tracking-widest uppercase font-bold text-[#181818]">MEN</h3>
                        </div>

                        <div className="flex flex-col space-y-2 text-xs text-[#6E6E6E] font-sans font-semibold">
                          <Link to="/shop?category=MEN&subcategory=Kurtas" className="flex justify-between items-center hover:text-[#B68D40] group py-0.5">
                            <span>Kurtas</span>
                            <span className="text-[10px] text-neutral-400 group-hover:translate-x-1 transition-transform">&gt;</span>
                          </Link>
                          <Link to="/shop?category=MEN&subcategory=Sherwanis" className="flex justify-between items-center hover:text-[#B68D40] group py-0.5">
                            <span>Sherwanis</span>
                            <span className="text-[10px] text-neutral-400 group-hover:translate-x-1 transition-transform">&gt;</span>
                          </Link>
                          <Link to="/shop?category=MEN" className="flex justify-between items-center hover:text-[#B68D40] group py-0.5">
                            <span>Dhotis</span>
                            <span className="text-[10px] text-neutral-400 group-hover:translate-x-1 transition-transform">&gt;</span>
                          </Link>
                        </div>
                      </div>

                      <div className="aspect-[1.5/1] rounded-xl overflow-hidden bg-neutral-50 border border-[#E6DCCF]">
                        <img src={menSherwaniSun} alt="Men's collection" className="w-full h-full object-cover object-top" loading="lazy" />
                      </div>
                    </div>

                    {/* Column 2: WOMEN */}
                    <div className="col-span-3 space-y-6 flex flex-col justify-between text-left">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-[#E6DCCF] pb-2">
                          <svg className="w-5 h-5 text-[#B68D40]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 3L16 9M12 3L8 9M8 9H16M8 9L6 21H18L16 9" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <h3 className="font-serif text-sm tracking-widest uppercase font-bold text-[#181818]">WOMEN</h3>
                        </div>

                        <div className="flex flex-col space-y-1.5 text-xs text-[#6E6E6E] font-sans font-semibold">
                          <Link to="/shop?category=WOMEN&subcategory=Sarees" className="flex justify-between items-center hover:text-[#B68D40] group py-0.5">
                            <span>Sarees</span>
                            <span className="text-[10px] text-neutral-400 group-hover:translate-x-1 transition-transform">&gt;</span>
                          </Link>
                          <Link to="/shop?category=WOMEN&subcategory=Lehengas" className="flex justify-between items-center hover:text-[#B68D40] group py-0.5">
                            <span>Lehengas</span>
                            <span className="text-[10px] text-neutral-400 group-hover:translate-x-1 transition-transform">&gt;</span>
                          </Link>
                          <Link to="/shop?category=WOMEN&subcategory=Anarkalis" className="flex justify-between items-center hover:text-[#B68D40] group py-0.5">
                            <span>Anarkalis</span>
                            <span className="text-[10px] text-neutral-400 group-hover:translate-x-1 transition-transform">&gt;</span>
                          </Link>
                          <Link to="/shop?category=WOMEN" className="flex justify-between items-center hover:text-[#B68D40] group py-0.5">
                            <span>Indo-Western</span>
                            <span className="text-[10px] text-neutral-400 group-hover:translate-x-1 transition-transform">&gt;</span>
                          </Link>
                          <Link to="/shop?category=WOMEN&subcategory=Sarees" className="flex justify-between items-center hover:text-[#B68D40] group py-0.5">
                            <span>Pre-Draped Sarees</span>
                            <span className="text-[10px] text-neutral-400 group-hover:translate-x-1 transition-transform">&gt;</span>
                          </Link>
                          <Link to="/shop?category=WOMEN&subcategory=Anarkalis" className="flex justify-between items-center hover:text-[#B68D40] group py-0.5">
                            <span>Frocks</span>
                            <span className="text-[10px] text-neutral-400 group-hover:translate-x-1 transition-transform">&gt;</span>
                          </Link>
                        </div>
                      </div>

                      <div className="aspect-[2.3/1] rounded-xl overflow-hidden bg-neutral-50 border border-[#E6DCCF]">
                        <img src={womenMaroonLehenga} alt="Women's collection" className="w-full h-full object-cover object-center" loading="lazy" />
                      </div>
                    </div>

                    {/* Column 3: KIDS */}
                    <div className="col-span-3 space-y-6 flex flex-col justify-between text-left">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-[#E6DCCF] pb-2">
                          <svg className="w-5 h-5 text-[#B68D40]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="8" cy="7" r="3"/>
                            <circle cx="16" cy="7" r="3"/>
                            <path d="M4 18C4 15 6 13 8 13M20 18C20 15 18 13 16 13" strokeLinecap="round"/>
                          </svg>
                          <h3 className="font-serif text-sm tracking-widest uppercase font-bold text-[#181818]">KIDS</h3>
                        </div>

                        <div className="flex flex-col space-y-2 text-xs text-[#6E6E6E] font-sans font-semibold">
                          <Link to="/shop?category=KIDS" className="flex justify-between items-center hover:text-[#B68D40] group py-0.5">
                            <span>Girls</span>
                            <span className="text-[10px] text-neutral-400 group-hover:translate-x-1 transition-transform">&gt;</span>
                          </Link>
                          <Link to="/shop?category=KIDS" className="flex justify-between items-center hover:text-[#B68D40] group py-0.5">
                            <span>Boys</span>
                            <span className="text-[10px] text-neutral-400 group-hover:translate-x-1 transition-transform">&gt;</span>
                          </Link>
                        </div>
                      </div>

                      <div className="aspect-[1.3/1] rounded-xl overflow-hidden bg-neutral-50 border border-[#E6DCCF]">
                        <img src={kidsEthnicWear} alt="Kids collection" className="w-full h-full object-cover object-center" loading="lazy" />
                      </div>
                    </div>

                    {/* Column 4: Couple card */}
                    <div className="col-span-3 rounded-2xl overflow-hidden relative aspect-[0.78/1] border border-[#E6DCCF] flex flex-col justify-end p-6 text-left">
                      <img src={coupleWeddingIvory} alt="Wedding couple" className="absolute inset-0 w-full h-full object-cover object-top" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

                      <div className="relative z-10 space-y-4 text-white">
                        <div className="space-y-1">
                          <h3 className="font-serif text-xl leading-tight">
                            Timeless<br/>Tradition.<br/><span className="text-[#D4AF37] italic font-light">Modern You.</span>
                          </h3>
                          <p className="text-[9px] font-sans text-neutral-300 leading-relaxed uppercase tracking-wider">
                            Explore our handpicked designer collections.
                          </p>
                        </div>

                        <Link
                          to="/shop"
                          className="bg-[#181818] hover:bg-[#B68D40] text-[#D4AF37] hover:text-[#181818] border border-[#B68D40] px-4 py-2.5 text-[8.5px] font-sans font-bold tracking-widest uppercase transition-all duration-300 w-full flex items-center justify-center gap-1.5"
                        >
                          <span>VIEW ALL COLLECTIONS</span>
                          <span>&gt;</span>
                        </Link>
                      </div>
                    </div>

                  </div>

                  {/* Bottom value props row */}
                  <div className="max-w-[1440px] mx-auto border-t border-[#E6DCCF] pt-6 mt-6 grid grid-cols-4 gap-4 text-center text-xs">
                    <div className="flex items-center justify-center gap-2 py-1">
                      <svg className="w-4 h-4 text-[#B68D40] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                      <div className="text-left leading-tight">
                        <p className="font-bold text-[#181818]">Free Shipping</p>
                        <p className="text-[9.5px] text-neutral-400">Across India</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 py-1">
                      <svg className="w-4 h-4 text-[#B68D40] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <div className="text-left leading-tight">
                        <p className="font-bold text-[#181818]">Premium Quality</p>
                        <p className="text-[9.5px] text-neutral-400">Assured</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 py-1">
                      <svg className="w-4 h-4 text-[#B68D40] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <div className="text-left leading-tight">
                        <p className="font-bold text-[#181818]">Stylist Support</p>
                        <p className="text-[9.5px] text-neutral-400">+91 89783 59546</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 py-1">
                      <svg className="w-4 h-4 text-[#B68D40] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      <div className="text-left leading-tight">
                        <p className="font-bold text-[#181818]">Easy Returns</p>
                        <p className="text-[9.5px] text-neutral-400">Within 7 Days</p>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
            <span className="text-neutral-300 font-light select-none">|</span>

            <Link
              to="/customize"
              className={`transition-colors duration-200 ${pathname === '/customize' ? 'text-[#B68D40]' : 'hover:text-[#B68D40]'}`}
            >
              CUSTOMISE
            </Link>
            <span className="text-neutral-300 font-light select-none">|</span>

            <Link
              to="/about"
              className={`transition-colors duration-200 ${pathname === '/about' ? 'text-[#B68D40]' : 'hover:text-[#B68D40]'}`}
            >
              ABOUT
            </Link>
            <span className="text-neutral-300 font-light select-none">|</span>

            <Link
              to="/contact"
              className={`transition-colors duration-200 ${pathname === '/contact' ? 'text-[#B68D40]' : 'hover:text-[#B68D40]'}`}
            >
              CONTACT
            </Link>
          </nav>

        </div>
      </header>

      {/* MOBILE DRAWER MENU — Fix #8: kept mounted, animated via translate-x + opacity */}
      <div className={`fixed inset-0 z-50 md:hidden flex ${mobileMenuOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        <div
          className={`relative w-4/5 max-w-sm bg-white dark:bg-[#181818] h-full flex flex-col p-8 transition-transform duration-300 shadow-2xl ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2 text-[#181818] dark:text-[#F8F6F2] focus:outline-none hover:text-[#B68D40]"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-12 mt-6">
            <img
              src={settings?.logoUrl || logoAsset}
              alt="Etniko - Designer Boutique"
              className="h-12 w-auto object-contain"
              loading="lazy"
            />
          </div>

          <div className="flex flex-col space-y-6">
            <Link to="/" onClick={closeMobileMenu} className={mobileLinkClass('/')}>
              HOME
            </Link>

            <Link to="/look-and-shop" onClick={closeMobileMenu} className={mobileLinkClass('/look-and-shop')}>
              LOOK & SHOP
            </Link>

            {/* SHOP Accordion — Fix #11: accessibility attrs, Fix #13: chevron icons */}
            <div>
              <button
                onClick={() => setMobileShopOpen(!mobileShopOpen)}
                className="w-full flex justify-between items-center text-xs tracking-[0.2em] font-semibold uppercase hover:text-[#B68D40] transition-colors"
                aria-expanded={mobileShopOpen}
                aria-controls="mobile-shop-menu"
              >
                <span>SHOP</span>
                {mobileShopOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {mobileShopOpen && (
                <div
                  id="mobile-shop-menu"
                  className="mt-5 ml-4 flex flex-col space-y-2 max-h-[45vh] overflow-y-auto pr-2"
                >
                  <p className="text-[#B68D40] font-bold">MEN</p>

                  <Link to="/shop?category=MEN&subcategory=Kurtas" onClick={closeMobileMenu} className="hover:text-[#B68D40] transition-colors">
                    Kurtas
                  </Link>
                  <Link to="/shop?category=MEN&subcategory=Sherwanis" onClick={closeMobileMenu} className="hover:text-[#B68D40] transition-colors">
                    Sherwanis
                  </Link>
                  <Link to="/shop?category=MEN" onClick={closeMobileMenu} className="hover:text-[#B68D40] transition-colors">
                    Dhotis
                  </Link>

                  <p className="pt-3 text-[#B68D40] font-bold">WOMEN</p>

                  <Link to="/shop?category=WOMEN&subcategory=Sarees" onClick={closeMobileMenu} className="hover:text-[#B68D40] transition-colors">
                    Sarees
                  </Link>
                  <Link to="/shop?category=WOMEN&subcategory=Lehengas" onClick={closeMobileMenu} className="hover:text-[#B68D40] transition-colors">
                    Lehengas
                  </Link>
                  <Link to="/shop?category=WOMEN&subcategory=Anarkalis" onClick={closeMobileMenu} className="hover:text-[#B68D40] transition-colors">
                    Anarkalis
                  </Link>
                  <Link to="/shop?category=WOMEN" onClick={closeMobileMenu} className="hover:text-[#B68D40] transition-colors">
                    Indo-Western
                  </Link>
                  <Link to="/shop?category=WOMEN&subcategory=Sarees" onClick={closeMobileMenu} className="hover:text-[#B68D40] transition-colors">
                    Pre-Draped Sarees
                  </Link>
                  <Link to="/shop?category=WOMEN&subcategory=Anarkalis" onClick={closeMobileMenu} className="hover:text-[#B68D40] transition-colors">
                    Frocks
                  </Link>

                  <p className="pt-3 text-[#B68D40] font-bold">KIDS</p>

                  <Link to="/shop?category=KIDS" onClick={closeMobileMenu} className="hover:text-[#B68D40] transition-colors">
                    Girls
                  </Link>
                  <Link to="/shop?category=KIDS" onClick={closeMobileMenu} className="hover:text-[#B68D40] transition-colors">
                    Boys
                  </Link>

                  <Link
                    to="/shop"
                    onClick={closeMobileMenu}
                    className="pt-4 text-[#B68D40] font-semibold hover:opacity-80 transition-opacity"
                  >
                    VIEW ALL COLLECTIONS →
                  </Link>
                </div>
              )}
            </div>

            <Link to="/customize" onClick={closeMobileMenu} className={mobileLinkClass('/customize')}>
              CUSTOMISE
            </Link>

            <Link to="/about" onClick={closeMobileMenu} className={mobileLinkClass('/about')}>
              ABOUT
            </Link>

            <Link to="/contact" onClick={closeMobileMenu} className={mobileLinkClass('/contact')}>
              CONTACT
            </Link>
          </div>

          <div className="mt-auto border-t border-[#ECECEC] pt-6 flex flex-col space-y-4">
            <p className="text-[9px] font-sans text-neutral-400">© 2026 ETNIKO Studio. Hyderabad Boutique.</p>
          </div>
        </div>
      </div>
    </>
  );
}