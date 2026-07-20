import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle, 
  Lock, 
  Sparkles, 
  Calendar, 
  HeartHandshake, 
  Truck 
} from 'lucide-react';

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
import { motion, AnimatePresence } from 'framer-motion';
import luxuryStoreInterior from '../assets/luxury_store_interior.png';

export default function Contact() {
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    subject: "", 
    enquiryType: "", 
    message: "" 
  });
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await productService.getPublicSettings();
        setSettings(data);
      } catch (err) {
        console.error('Error fetching settings in contact:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setFormData({ 
      name: "", 
      email: "", 
      phone: "", 
      subject: "", 
      enquiryType: "", 
      message: "" 
    });
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div
      className="text-[#181818] min-h-screen space-y-16 pb-0 bg-fixed bg-no-repeat bg-cover"
      style={{ background: "linear-gradient(180deg, #FBE7C6 0%, #F6EFE3 40%, #E9DCC4 100%)" }}
    >
      
      {/* SECTION 1: HERO SPLIT BANNER */}
      <section className="relative w-full h-[55vh] md:h-[45vh] bg-[#181818] overflow-hidden flex flex-col md:flex-row items-center justify-between border-b">
        <div className="w-full md:w-1/2 px-6 md:px-16 py-8 space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-light tracking-wide uppercase text-[#F8F6F2]">
            CONTACT US
          </h1>
          <div className="w-12 h-[1px] bg-[#B68D40]" />
          <p className="text-xs font-sans text-neutral-300 leading-relaxed max-w-md">
            We would love to hear from you. Whether you have a question about our collections, need styling advice, or want to book an appointment, our team is here to help you.
          </p>
        </div>

        <div className="w-full md:w-1/2 h-full relative">
          <img
            src={luxuryStoreInterior}
            alt="Luxury Boutique Interior"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </section>

      {/* SECTION 2: THREE COLUMN LAYOUT */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start pt-4">
        
        {/* Column 1: Send us a message form */}
        <div className="bg-[#FBF6EC] border border-[#E6DCCF] p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-serif text-base tracking-widest text-[#181818] uppercase">SEND US A MESSAGE</h3>
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-6 h-[0.5px] bg-[#B68D40]" />
              <span className="text-[7.5px] text-[#B68D40]">✦</span>
              <span className="w-6 h-[0.5px] bg-[#B68D40]" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-sans block font-semibold">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text" required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full bg-white border border-[#E6DCCF] px-3 py-2.5 text-xs text-[#181818] focus:outline-none focus:border-[#B68D40]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-sans block font-semibold">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text" required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter your phone number"
                className="w-full bg-white border border-[#E6DCCF] px-3 py-2.5 text-xs text-[#181818] focus:outline-none focus:border-[#B68D40]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-sans block font-semibold">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email" required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                className="w-full bg-white border border-[#E6DCCF] px-3 py-2.5 text-xs text-[#181818] focus:outline-none focus:border-[#B68D40]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-sans block font-semibold">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-white border border-[#E6DCCF] px-3 py-2.5 text-xs text-[#181818] focus:outline-none focus:border-[#B68D40]"
                >
                  <option value="">Select a subject</option>
                  <option value="Consultation">Private Fitting</option>
                  <option value="Sizing">Bespoke Custom sizing</option>
                  <option value="Collab">Designer Collaboration</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-sans block font-semibold">
                  Enquiry Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.enquiryType}
                  onChange={(e) => setFormData({ ...formData, enquiryType: e.target.value })}
                  className="w-full bg-white border border-[#E6DCCF] px-3 py-2.5 text-xs text-[#181818] focus:outline-none focus:border-[#B68D40]"
                >
                  <option value="">Select enquiry type</option>
                  <option value="Bridal">Bridal couture</option>
                  <option value="Groom">Groom handlooms</option>
                  <option value="Support">Order & shipment</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-sans block font-semibold">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3} required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Type your message here..."
                className="w-full bg-white border border-[#E6DCCF] px-3 py-2 text-xs text-[#181818] focus:outline-none focus:border-[#B68D40] resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#181818] hover:bg-[#B68D40] text-[#D4AF37] hover:text-[#181818] border border-[#B68D40] py-3.5 text-[10px] font-sans font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                <span>SEND MESSAGE</span>
                <span>&gt;</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[9px] text-neutral-400 font-sans mt-2">
              <Lock className="w-3 h-3 text-[#B68D40]" />
              <span>We respect your privacy. Your information is safe with us.</span>
            </div>

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#3E7C59]/10 border border-[#3E7C59] p-3 text-center text-[9.5px] uppercase tracking-wider text-[#3E7C59] font-bold"
                >
                  ✓ Message sent successfully! Our stylist will respond shortly.
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Column 2: Get in Touch direct contacts */}
        <div className="bg-[#FBF6EC] border border-[#E6DCCF] p-8 shadow-sm space-y-6 h-full">
          <div className="text-center space-y-1">
            <h3 className="font-serif text-base tracking-widest text-[#181818] uppercase">GET IN TOUCH</h3>
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-6 h-[0.5px] bg-[#B68D40]" />
              <span className="text-[7.5px] text-[#B68D40]">✦</span>
              <span className="w-6 h-[0.5px] bg-[#B68D40]" />
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Phone contact */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#181818] flex items-center justify-center text-[#D4AF37] shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[10px] tracking-widest font-sans font-bold text-neutral-400 uppercase">PHONE</h4>
                <p className="text-xs font-semibold text-[#181818]">{settings?.whatsappNumber ? `+91 ${settings.whatsappNumber}` : '+91 89783 59546'}</p>
                <p className="text-[10px] text-neutral-400">{settings?.storeHours || 'Mon - Sun : 10:30 AM - 8:30 PM'}</p>
              </div>
            </div>

            {/* WhatsApp link */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#181818] flex items-center justify-center text-[#D4AF37] shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[10px] tracking-widest font-sans font-bold text-neutral-400 uppercase">WHATSAPP</h4>
                <a 
                  href={settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber}` : 'https://wa.me/918978359546'} 
                  target="_blank" rel="noreferrer"
                  className="text-xs font-semibold text-[#3E7C59] hover:underline block"
                >
                  {settings?.whatsappNumber ? `+91 ${settings.whatsappNumber}` : '+91 89783 59546'}
                </a>
                <p className="text-[10px] text-neutral-400">Chat with our stylist</p>
              </div>
            </div>

            {/* Email contact */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#181818] flex items-center justify-center text-[#D4AF37] shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[10px] tracking-widest font-sans font-bold text-neutral-400 uppercase">EMAIL</h4>
                <p className="text-xs font-semibold text-[#181818]">{settings?.socialLinks?.email || 'hello@etniko.com'}</p>
                <p className="text-[10px] text-neutral-400">We reply within 24 hours</p>
              </div>
            </div>

            {/* Instagram links */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#181818] flex items-center justify-center text-[#D4AF37] shrink-0">
                <InstagramIcon className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[10px] tracking-widest font-sans font-bold text-neutral-400 uppercase">INSTAGRAM</h4>
                <p className="text-xs font-semibold text-[#181818]">{settings?.socialLinks?.instagram || '@etniko.boutique'}</p>
                <p className="text-[10px] text-neutral-400">Follow for latest collections</p>
              </div>
            </div>

            {/* visit boutique */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#181818] flex items-center justify-center text-[#D4AF37] shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-[10px] tracking-widest font-sans font-bold text-neutral-400 uppercase">VISIT OUR STUDIO</h4>
                <p className="text-xs font-sans text-neutral-600 leading-relaxed max-w-[200px]">
                  {settings?.socialLinks?.address || 'Plot 540, Road No. 36, Jubilee Hills, Near Metro Station, Hyderabad, Telangana, 500033'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Column 3: Visit our studio interactive map */}
        <div className="bg-[#FBF6EC] border border-[#E6DCCF] p-8 shadow-sm space-y-6 h-full flex flex-col justify-between">
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="font-serif text-base tracking-widest text-[#181818] uppercase">VISIT OUR STUDIO</h3>
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-6 h-[0.5px] bg-[#B68D40]" />
                <span className="text-[7.5px] text-[#B68D40]">✦</span>
                <span className="w-6 h-[0.5px] bg-[#B68D40]" />
              </div>
            </div>
            
            <p className="text-[10px] font-sans text-neutral-400 text-center uppercase tracking-wider">
              Experience our collections in person. Book your private consultation today.
            </p>

            {/* Custom SVG stylized Map representation to avoid broken iframe */}
            <div className="relative aspect-[1.4/1] w-full border border-[#D9C7A3] bg-white overflow-hidden p-2 flex flex-col justify-end">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* stylized map streets */}
                <path d="M 0 35 L 140 35" stroke="#ECECEC" strokeWidth="3" />
                <path d="M 0 50 L 140 75" stroke="#D9C7A3" strokeWidth="2.5" />
                <path d="M 30 0 L 30 100" stroke="#ECECEC" strokeWidth="2" />
                <path d="M 95 0 L 95 100" stroke="#ECECEC" strokeWidth="2" />
                
                {/* Labels */}
                <text x="5" y="30" fill="#B68D40" fontSize="3.5" fontFamily="sans-serif" fontWeight="bold">HANUMAN NAGAR</text>
                <text x="65" y="47" fill="#888" fontSize="3.5" fontFamily="sans-serif" transform="rotate(10, 65, 47)">100 FEET RD</text>
                <text x="98" y="25" fill="#888" fontSize="3" fontFamily="sans-serif">Kondapur</text>
                <text x="98" y="55" fill="#888" fontSize="3.5" fontFamily="sans-serif" fontWeight="bold">Botanical Garden</text>
                
                {/* central Pin */}
                <g transform="translate(70, 48)">
                  <circle cx="0" cy="0" r="1.5" fill="#000" />
                  <path d="M 0 0 C -2 -3, -3 -6, 0 -9 C 3 -6, 2 -3, 0 0 Z" fill="#B68D40" />
                  <circle cx="0" cy="-6" r="1" fill="#FFF" />
                </g>
              </svg>
              <div className="relative z-10 bg-white/90 p-2 text-center text-[7px] font-mono tracking-widest text-[#B68D40]">
                Kondapur, Hyderabad • 17.4616° N, 78.3684° E
              </div>
            </div>
          </div>

          <div className="pt-6">
            <a 
              href={settings?.socialLinks?.googleMapsUrl || "https://maps.google.com/?q=Jubilee+Hills+Hyderabad+Etniko"} 
              target="_blank" rel="noreferrer"
              className="w-full bg-[#181818] hover:bg-[#B68D40] text-[#D4AF37] hover:text-[#181818] border border-[#B68D40] py-3.5 text-[9.5px] font-sans font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>GET DIRECTIONS</span>
            </a>
          </div>
        </div>

      </section>

      {/* SECTION 3: VALUE PROPOSITIONS BAR */}
      <section className="max-w-7xl mx-auto px-6 border-t border-[#E6DCCF] pt-12 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Sparkles className="w-5 h-5 text-[#B68D40]" />
            <h4 className="text-[10px] tracking-wider font-sans font-bold uppercase text-[#181818]">PERSONAL STYLIST</h4>
            <p className="text-[9px] font-sans text-neutral-400">Get expert styling advice from our experienced team.</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Calendar className="w-5 h-5 text-[#B68D40]" />
            <h4 className="text-[10px] tracking-wider font-sans font-bold uppercase text-[#181818]">BOOK APPOINTMENT</h4>
            <p className="text-[9px] font-sans text-neutral-400">Schedule a private viewing at our studio.</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <HeartHandshake className="w-5 h-5 text-[#B68D40]" />
            <h4 className="text-[10px] tracking-wider font-sans font-bold uppercase text-[#181818]">WEDDING ASSISTANCE</h4>
            <p className="text-[9px] font-sans text-neutral-400">Complete wardrobe solutions for your special day.</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Truck className="w-5 h-5 text-[#B68D40]" />
            <h4 className="text-[10px] tracking-wider font-sans font-bold uppercase text-[#181818]">PAN INDIA DELIVERY</h4>
            <p className="text-[9px] font-sans text-neutral-400">Secure and reliable delivery across India.</p>
          </div>
        </div>
      </section>

      {/* SECTION 4: DARK QUOTATION AT THE BOTTOM */}
      <section className="bg-[#181818] text-[#F8F6F2] py-10 px-6 border-t border-neutral-900 text-center flex flex-col items-center justify-center space-y-3 select-none">
        <span className="text-[#B68D40] text-3xl font-serif leading-none">“</span>
        <h2 className="font-serif text-lg md:text-xl tracking-wider text-[#D4AF37] max-w-xl leading-relaxed italic">
          Every conversation brings us closer to creating something beautiful for you.
        </h2>
        <span className="text-[#B68D40] text-3xl font-serif leading-none">”</span>
      </section>

    </div>
  );
}