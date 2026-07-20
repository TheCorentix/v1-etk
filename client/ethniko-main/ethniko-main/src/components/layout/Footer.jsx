import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, ArrowRight } from 'lucide-react';
import { productService } from '../../services/productService';

// Lucide doesn't ship Pinterest / WhatsApp glyphs, so these are lightweight custom outlines
// kept in the same stroke style as the lucide icons for visual consistency.
const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

const PinterestIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8 20c1-3 2-6.5 2.5-9" />
    <path d="M9.5 14.5c-.7-1.4-.4-4.2 1.7-5.3 2.5-1.3 5.3.2 5.5 3 .2 2.4-1.2 5.3-3.7 5.3-1 0-1.7-.4-2-1" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v3.5H8V21h3.5v-7.5h3l.5-3.5h-3.5V7.5c0-.6.4-1 1-1H15V3Z" />
  </svg>
);

const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20.5 11.9a8.5 8.5 0 1 1-3.8-7.1" />
    <path d="M20.5 11.9c0 4.7-3.8 8.5-8.5 8.5-1.4 0-2.7-.3-3.9-.9L3.5 20.5l1-4.5a8.4 8.4 0 0 1-1-4c0-.1 0-.2 0-.3" />
    <path d="M9 9.3c.1-.6.6-1 1.1-1h.5c.3 0 .5.2.6.5l.6 1.5c.1.3 0 .6-.2.8l-.5.5c.5.9 1.3 1.7 2.2 2.2l.5-.5c.2-.2.5-.3.8-.2l1.5.6c.3.1.5.3.5.6v.5c0 .5-.4 1-1 1.1-2.6.4-6-3-6.4-5.6" />
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await productService.getPublicSettings();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching settings in footer:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  const socials = [
    { label: 'Instagram', Icon: InstagramIcon, href: settings?.socialLinks?.instagramUrl || settings?.socialLinks?.instagram || '#' },
    { label: 'Pinterest', Icon: PinterestIcon, href: settings?.socialLinks?.pinterestUrl || settings?.socialLinks?.pinterest || '#' },
    { label: 'WhatsApp', Icon: WhatsAppIcon, href: settings?.whatsappNumber || settings?.whatsappUrl ? `https://wa.me/${settings.whatsappNumber || settings.whatsappUrl}` : '#' },
    { label: 'Facebook', Icon: FacebookIcon, href: settings?.socialLinks?.facebookUrl || settings?.socialLinks?.facebook || '#' },
  ];

  return (
    <footer className="bg-[#181818] text-[#F8F6F2] pt-20 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Editorial Brand Story */}
        <div className="space-y-6 md:col-span-1">
          <span className="font-serif text-2xl tracking-[0.25em] font-light block">{settings?.storeName || 'ETNIKO'}</span>
          <p className="text-[11px] font-sans leading-relaxed text-neutral-400 text-justify">
            {settings?.footer?.textBlocks?.[0] || 'ETNIKO is an architectural tribute to the art of ethnic drapes. Founded in Hyderabad by designer Niharika, our studio creates body-inclusive, customizable handloom garments woven with heritage zari details and a deep commitment to Indian artisan preservation.'}
          </p>
          <div className="flex space-x-3 pt-2">
            {socials.map(({ label, Icon, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="group w-9 h-9 flex items-center justify-center rounded-full border border-neutral-700 text-[#D9C7A3] hover:border-[#D9C7A3] hover:bg-[#D9C7A3] transition-all duration-300"
              >
                <Icon className="w-[15px] h-[15px] transition-colors duration-300 group-hover:text-[#181818]" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>

        {/* Collection Links */}
        <div className="space-y-4">
          <h4 className="text-[10px] tracking-[0.25em] font-sans font-semibold uppercase text-[#D9C7A3]">COLLECTIONS</h4>
          <ul className="space-y-2.5 text-xs font-sans text-neutral-400">
            <li>
              <Link to="/shop?category=WOMEN" className="hover:text-white transition-colors">Women's Pre-Draped Sarees</Link>
            </li>
            <li>
              <Link to="/shop?category=WOMEN&sub=Lehengas" className="hover:text-white transition-colors">Bridal Lehengas</Link>
            </li>
            <li>
              <Link to="/shop?category=MEN" className="hover:text-white transition-colors">Men's Handloom Kurtas</Link>
            </li>
            <li>
              <Link to="/shop?category=KIDS" className="hover:text-white transition-colors">Festive Kids Couture</Link>
            </li>
            <li>
              <Link to="/customize" className="hover:text-white transition-colors">Bespoke Custom Designing</Link>
            </li>
          </ul>
        </div>

        {/* Boutique Location & Hours */}
        <div className="space-y-4">
          <h4 className="text-[10px] tracking-[0.25em] font-sans font-semibold uppercase text-[#D9C7A3]">FLAGSHIP STUDIO</h4>
          <div className="space-y-3.5 text-xs font-sans text-neutral-400">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#D9C7A3] shrink-0 mt-0.5" />
              <span>Plot 540, Road No. 36, Jubilee Hills, Near Metro Station, Hyderabad, Telangana, 500033</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#D9C7A3] shrink-0" />
              <span>+91 98300 12345 / +91 40 4567 8910</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#D9C7A3] shrink-0 mt-0.5" />
              <div>
                <p>{settings?.storeHours || '11:00 AM – 8:00 PM (IST)'}</p>
                <p className="text-[10px] text-[#D9C7A3]">Open All Seven Days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="space-y-4">
          <h4 className="text-[10px] tracking-[0.25em] font-sans font-semibold uppercase text-[#D9C7A3]">THE STUDIO JOURNAL</h4>
          <p className="text-[11px] font-sans leading-relaxed text-neutral-400">
            Subscribe to receive invitations to private studio collections previews, custom fabric arrivals, and designer trunk shows.
          </p>
          <form onSubmit={handleSubscribe} className="relative mt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="YOUR EMAIL"
              required
              className="w-full bg-transparent border-b border-neutral-700 py-2.5 pr-10 text-xs font-sans tracking-wider text-white placeholder-neutral-500 focus:outline-none focus:border-[#D9C7A3] transition-colors"
            />
            <button
              type="submit"
              className="absolute right-0 top-1.5 p-1 text-[#D9C7A3] hover:text-white transition-colors"
              aria-label="Subscribe to newsletter"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          {submitted && (
            <p className="text-[9px] uppercase tracking-widest text-[#3E7C59] animate-pulse mt-2">
              Welcome to the inner circle.
            </p>
          )}
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between text-[10px] font-sans tracking-widest text-neutral-500 gap-4">
        <div>
          <span>{settings?.footer?.copyright || `© ${new Date().getFullYear()} ${settings?.storeName || 'ETNIKO'} DESIGNER STUDIO. ALL RIGHTS RESERVED.`}</span>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-neutral-300">PRIVACY POLICY</a>
          <a href="#" className="hover:text-neutral-300">TERMS & CONDITIONS</a>
          <Link to="/admin" className="hover:text-neutral-300">ADMIN CONTROL</Link>
        </div>
      </div>
    </footer>
  );
}