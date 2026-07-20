import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { 
  Sparkles, 
  Scissors, 
  Users, 
  MapPin, 
  Clock, 
  Phone, 
  HeartHandshake, 
  Coins, 
  ShieldCheck,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import greenLehengaHero from '../assets/green_lehenga_hero.png';
import luxuryStoreInterior from '../assets/luxury_store_interior.png';

export default function About() {
  const navigate = useNavigate();
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const data = await adminService.getAboutPage();
        setAboutData(data);
      } catch (err) {
        console.error('Error fetching about page:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  return (
    <div
      className="text-[#181818] min-h-screen space-y-20 pb-0 bg-fixed bg-no-repeat bg-cover"
      style={{ background: "linear-gradient(180deg, #FBE7C6 0%, #F6EFE3 40%, #E9DCC4 100%)" }}
    >
      
      {/* SECTION 1: HERO SPLIT BANNER */}
      <section className="relative w-full h-[55vh] md:h-[45vh] bg-[#181818] overflow-hidden flex flex-col md:flex-row items-center justify-between">
        <div className="w-full md:w-1/2 px-6 md:px-16 py-8 space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-light tracking-wide uppercase text-[#F8F6F2]">
            ABOUT ETNIKO
          </h1>
          <div className="w-12 h-[1px] bg-[#B68D40]" />
          <p className="text-xs font-sans text-neutral-300 leading-relaxed max-w-md">
            {aboutData?.mission || 'Etniko is more than a label — it is a celebration of Indian heritage, craftsmanship and timeless elegance. We create exquisite ethnic wear that is rooted in tradition yet designed for the modern world.'}
          </p>
        </div>

        <div className="w-full md:w-1/2 h-full relative">
          <img
            src={aboutData?.founderImageUrl || greenLehengaHero}
            alt="About Etniko Cover Saree"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/40 via-transparent to-transparent" />
        </div>
      </section>

      {/* SECTION 2: OUR STORY */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
        
        {/* Left Column Description */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl tracking-widest text-[#181818] uppercase">OUR STORY</h2>
            <div className="w-12 h-[1px] bg-[#B68D40]" />
          </div>
          <div className="space-y-4 text-xs font-sans text-[#6E6E6E] leading-relaxed text-justify">
            {aboutData?.story ? (
              aboutData.story.split('\n').map((p, idx) => (
                <p key={idx}>{p}</p>
              ))
            ) : (
              <>
                <p>
                  Etniko was born from a simple belief — every individual deserves to feel their most beautiful in something made especially for them.
                </p>
                <p>
                  From intricate hand embroideries to luxurious fabrics, each creation is thoughtfully designed and handcrafted by skilled artisans who pour their heart into every detail.
                </p>
                <p>
                  We blend our rich cultural heritage with contemporary aesthetics to bring you outfits that are timeless, elegant and uniquely yours.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Three Cards Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="group rounded-lg bg-[#FBF6EC] border border-[#E6DCCF] flex flex-col justify-between h-full overflow-hidden shadow-[0_4px_16px_-10px_rgba(24,24,24,0.15)] hover:shadow-[0_14px_32px_-14px_rgba(182,141,64,0.4)] hover:border-[#B68D40] hover:-translate-y-1 transition-all duration-500">
            <div className="aspect-[1.3/1] bg-neutral-100 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1610030470298-4c5855797ee3?auto=format&fit=crop&w=400&q=80"
                alt="Heritage Craftsmanship"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-4 space-y-2 border-t border-[#E6DCCF]">
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-[#181818] flex items-center justify-center text-[#D4AF37] shrink-0">
                  <Star className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-[10px] tracking-wider font-sans font-bold uppercase text-[#181818]">
                  HERITAGE CRAFTSMANSHIP
                </h4>
              </div>
              <p className="text-[9.5px] font-sans text-[#6E6E6E] leading-relaxed">
                Handcrafted with love by experienced artisans.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group rounded-lg bg-[#FBF6EC] border border-[#E6DCCF] flex flex-col justify-between h-full overflow-hidden shadow-[0_4px_16px_-10px_rgba(24,24,24,0.15)] hover:shadow-[0_14px_32px_-14px_rgba(182,141,64,0.4)] hover:border-[#B68D40] hover:-translate-y-1 transition-all duration-500">
            <div className="aspect-[1.3/1] bg-neutral-100 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=400&q=80"
                alt="Premium Quality"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-4 space-y-2 border-t border-[#E6DCCF]">
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-[#181818] flex items-center justify-center text-[#D4AF37] shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-[10px] tracking-wider font-sans font-bold uppercase text-[#181818]">
                  PREMIUM QUALITY
                </h4>
              </div>
              <p className="text-[9.5px] font-sans text-[#6E6E6E] leading-relaxed">
                We use the finest fabrics and embellishments.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group rounded-lg bg-[#FBF6EC] border border-[#E6DCCF] flex flex-col justify-between h-full overflow-hidden shadow-[0_4px_16px_-10px_rgba(24,24,24,0.15)] hover:shadow-[0_14px_32px_-14px_rgba(182,141,64,0.4)] hover:border-[#B68D40] hover:-translate-y-1 transition-all duration-500">
            <div className="aspect-[1.3/1] bg-neutral-100 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80"
                alt="Modern Elegance"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="p-4 space-y-2 border-t border-[#E6DCCF]">
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-[#181818] flex items-center justify-center text-[#D4AF37] shrink-0">
                  <Scissors className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-[10px] tracking-wider font-sans font-bold uppercase text-[#181818]">
                  MODERN ELEGANCE
                </h4>
              </div>
              <p className="text-[9.5px] font-sans text-[#6E6E6E] leading-relaxed">
                Contemporary designs that celebrate tradition.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: VALUE METRICS BAR */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="rounded-lg bg-[#FBF6EC] border border-[#E6DCCF] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center shadow-[0_4px_16px_-10px_rgba(24,24,24,0.12)]">
          <div className="flex items-center justify-center gap-4 py-2">
            <span className="text-3xl font-serif font-light text-[#B68D40] shrink-0">10K+</span>
            <div className="text-left space-y-0.5">
              <h4 className="text-[9.5px] tracking-widest font-sans font-bold text-[#181818] uppercase">HAPPY CUSTOMERS</h4>
              <p className="text-[9px] font-sans text-[#6E6E6E]">Personalised wardrobe service</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 py-2 divide-x-0 md:divide-x divide-[#E6DCCF]">
            <span className="text-3xl font-serif font-light text-[#B68D40] shrink-0 md:pl-6">500+</span>
            <div className="text-left space-y-0.5 pl-4">
              <h4 className="text-[9.5px] tracking-widest font-sans font-bold text-[#181818] uppercase">UNIQUE DESIGNS</h4>
              <p className="text-[9px] font-sans text-[#6E6E6E]">Couture silhouettes created</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 py-2 divide-x-0 md:divide-x divide-[#E6DCCF]">
            <span className="text-3xl font-serif font-light text-[#B68D40] shrink-0 md:pl-6">50+</span>
            <div className="text-left space-y-0.5 pl-4">
              <h4 className="text-[9.5px] tracking-widest font-sans font-bold text-[#181818] uppercase">SKILLED ARTISANS</h4>
              <p className="text-[9px] font-sans text-[#6E6E6E]">Preserving heritage pit looms</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: DOUBLE COLUMN (PROMISE & STUDIO) */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4 pb-20">
        
        {/* Left Column: Our Promise */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif text-lg tracking-widest text-[#181818] uppercase">OUR PROMISE</h3>
            <div className="w-12 h-[1px] bg-[#B68D40]" />
          </div>

          <div className="space-y-5">
            {/* Promise 1 */}
            <div className="flex gap-4 items-start">
              <div className="w-9 h-9 rounded-full bg-[#181818] flex items-center justify-center text-[#D4AF37] shrink-0">
                <Scissors className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[10px] tracking-widest font-sans font-bold text-[#181818] uppercase">CUSTOM MADE</h4>
                <p className="text-[9.5px] font-sans text-[#6E6E6E] leading-relaxed">
                  Personalised outfits tailored to perfection.
                </p>
              </div>
            </div>

            {/* Promise 2 */}
            <div className="flex gap-4 items-start">
              <div className="w-9 h-9 rounded-full bg-[#181818] flex items-center justify-center text-[#D4AF37] shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[10px] tracking-widest font-sans font-bold text-[#181818] uppercase">ETHICAL & SUSTAINABLE</h4>
                <p className="text-[9.5px] font-sans text-[#6E6E6E] leading-relaxed">
                  Responsible fashion that cares for people and planet.
                </p>
              </div>
            </div>

            {/* Promise 3 */}
            <div className="flex gap-4 items-start">
              <div className="w-9 h-9 rounded-full bg-[#181818] flex items-center justify-center text-[#D4AF37] shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[10px] tracking-widest font-sans font-bold text-[#181818] uppercase">TRANSPARENT PRICING</h4>
                <p className="text-[9.5px] font-sans text-[#6E6E6E] leading-relaxed">
                  Honest pricing with no hidden costs.
                </p>
              </div>
            </div>

            {/* Promise 4 */}
            <div className="flex gap-4 items-start">
              <div className="w-9 h-9 rounded-full bg-[#181818] flex items-center justify-center text-[#D4AF37] shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[10px] tracking-widest font-sans font-bold text-[#181818] uppercase">SECURE SHOPPING</h4>
                <p className="text-[9.5px] font-sans text-[#6E6E6E] leading-relaxed">
                  100% secure payments and safe checkout.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Visit Our Studio */}
        <div className="lg:col-span-6 rounded-lg bg-[#FBF6EC] border border-[#E6DCCF] p-6 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-[0_4px_16px_-10px_rgba(24,24,24,0.12)]">
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="font-serif text-base tracking-widest text-[#181818] uppercase">VISIT OUR STUDIO</h3>
              <p className="text-[9.5px] font-sans text-[#6E6E6E] leading-relaxed">
                K1 Primo, Hanuman Nagar, Kondapur, Hyderabad, Telangana 500084
              </p>
            </div>

            <div className="space-y-2 text-[10px] font-sans text-[#6E6E6E]">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#B68D40]" />
                <span>Mon - Sun : 10:30 AM - 8:30 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#B68D40]" />
                <span>+91 89783 59546</span>
              </div>
            </div>

            <div>
              <button
                onClick={() => navigate('/contact')}
                className="w-full bg-[#181818] hover:bg-[#B68D40] text-[#D4AF37] hover:text-[#181818] border border-[#B68D40] py-3.5 text-[9.5px] font-sans font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>GET DIRECTIONS</span>
              </button>
            </div>
          </div>

          <div className="aspect-[1.1/1] w-full rounded-lg bg-neutral-100 overflow-hidden border border-[#E6DCCF]">
            <img
              src={luxuryStoreInterior}
              alt="Boutique Studio Consultation Layout"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </section>

      {/* SECTION 5: DARK QUOTATION AT THE BOTTOM */}
      <section className="bg-[#181818] text-[#F8F6F2] py-14 px-6 text-center flex flex-col items-center justify-center space-y-3 select-none">
        <span className="text-[#B68D40] text-3xl font-serif leading-none">"</span>
        <h2 className="font-serif text-lg md:text-xl tracking-wider text-[#D4AF37] max-w-xl leading-relaxed italic">
          We don't just create outfits, we create memories that last a lifetime.
        </h2>
        <span className="text-[#B68D40] text-3xl font-serif leading-none">"</span>
      </section>

    </div>
  );
}