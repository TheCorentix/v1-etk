import React, { useState } from 'react';
import { Settings, Save, Sliders, Image, Video, HelpCircle, AlertCircle } from 'lucide-react';
import { useEtnikoStore } from '../store/useEtnikoStore';
import { Banner, HeroSlide } from '../types/schema';

export const AdminSettings: React.FC = () => {
  const settings = useEtnikoStore(state => state.settings);
  const updateSettings = useEtnikoStore(state => state.updateSettings);
  
  const banners = useEtnikoStore(state => state.banners);
  const updateBanners = useEtnikoStore(state => state.updateBanners);
  
  const heroSlides = useEtnikoStore(state => state.heroSlides);
  const updateHeroSlides = useEtnikoStore(state => state.updateHeroSlides);

  const [activeSubTab, setActiveSubTab] = useState<'store' | 'hero' | 'banners'>('store');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Store Setting States
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [storeHours, setStoreHours] = useState(settings.storeHours);
  const [lowStockThreshold, setLowStockThreshold] = useState(settings.lowStockThreshold);
  const [shippingCost, setShippingCost] = useState(settings.shippingCost);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings.freeShippingThreshold);
  
  // Payment states
  const [razorpayToggle, setRazorpayToggle] = useState(settings.paymentToggles.razorpay);
  const [codToggle, setCodToggle] = useState(settings.paymentToggles.cod);
  const [whatsappToggle, setWhatsappToggle] = useState(settings.paymentToggles.whatsapp);

  // Hero edit states (simplifying editing of slide 1 and slide 2 inline)
  const [heroSlidesState, setHeroSlidesState] = useState<HeroSlide[]>([...heroSlides]);
  
  // Banner edit states
  const [bannersState, setBannersState] = useState<Banner[]>([...banners]);

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      whatsappNumber,
      storeAddress,
      storeHours,
      lowStockThreshold,
      shippingCost,
      freeShippingThreshold,
      paymentToggles: {
        razorpay: razorpayToggle,
        cod: codToggle,
        whatsapp: whatsappToggle
      }
    });
    triggerSuccess('Store configuration settings saved successfully!');
  };

  const handleSaveHeroSlides = () => {
    updateHeroSlides(heroSlidesState);
    triggerSuccess('Boutique homepage Hero configs saved successfully!');
  };

  const handleSaveBanners = () => {
    updateBanners(bannersState);
    triggerSuccess('Campaign promotional banners schedule saved!');
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleHeroSlideChange = (id: string, field: keyof HeroSlide, value: any) => {
    setHeroSlidesState(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleBannerChange = (id: string, field: keyof Banner, value: any) => {
    setBannersState(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="border-b border-cream-200 pb-4 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-xl text-charcoal-900">Variables & Campaigns Settings</h3>
          <p className="text-xs text-charcoal-500 font-sans mt-0.5">Control store constants, payment toggles, hero slides, and promotions schedule.</p>
        </div>
        
        {/* Subtabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('store')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider font-sans border transition-all ${
              activeSubTab === 'store' ? 'border-teal-800 bg-teal-800 text-cream-50' : 'border-cream-200 bg-white text-charcoal-500'
            }`}
          >
            Constants & Shipping
          </button>
          <button
            onClick={() => setActiveSubTab('hero')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider font-sans border transition-all ${
              activeSubTab === 'hero' ? 'border-teal-800 bg-teal-800 text-cream-50' : 'border-cream-200 bg-white text-charcoal-500'
            }`}
          >
            Hero Slider
          </button>
          <button
            onClick={() => setActiveSubTab('banners')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider font-sans border transition-all ${
              activeSubTab === 'banners' ? 'border-teal-800 bg-teal-800 text-cream-50' : 'border-cream-200 bg-white text-charcoal-500'
            }`}
          >
            Campaign Banners
          </button>
        </div>
      </div>

      {/* Success alert message */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-sans text-emerald-800 flex items-center gap-2">
          <Save className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* SUBTAB 1: STORE CONSTANTS FORM */}
      {activeSubTab === 'store' && (
        <form onSubmit={handleSaveStoreSettings} className="space-y-6 text-xs font-sans text-charcoal-800">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Store details */}
            <div className="space-y-4 border border-cream-200 p-4 bg-cream-50/20">
              <h4 className="font-serif text-sm text-charcoal-900 border-b border-cream-100 pb-1.5 uppercase tracking-wider">Studio Contacts & Hours</h4>
              
              <div className="space-y-1">
                <label className="text-[10px] text-charcoal-500 uppercase font-medium">WhatsApp Phone *</label>
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  placeholder="+91 89783 59546"
                  className="w-full px-3 py-2 border border-cream-200 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-charcoal-500 uppercase font-medium">Studio Physical Address *</label>
                <textarea
                  rows={3}
                  required
                  value={storeAddress}
                  onChange={e => setStoreAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-cream-200 bg-white resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-charcoal-500 uppercase font-medium">Studio Working Hours *</label>
                <input
                  type="text"
                  required
                  value={storeHours}
                  onChange={e => setStoreHours(e.target.value)}
                  placeholder="Mon–Sun, 10:00 AM – 8:00 PM"
                  className="w-full px-3 py-2 border border-cream-200 bg-white"
                />
              </div>
            </div>

            {/* Logistics & Alerts */}
            <div className="space-y-4 border border-cream-200 p-4 bg-cream-50/20">
              <h4 className="font-serif text-sm text-charcoal-900 border-b border-cream-100 pb-1.5 uppercase tracking-wider">Logistics & Low Stock Alerts</h4>
              
              <div className="space-y-1">
                <label className="text-[10px] text-charcoal-500 uppercase font-medium">Low Stock Alert Threshold (pcs) *</label>
                <input
                  type="number"
                  required
                  value={lowStockThreshold}
                  onChange={e => setLowStockThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-cream-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-charcoal-500 uppercase font-medium">Flat Shipping Cost (INR) *</label>
                  <input
                    type="number"
                    required
                    value={shippingCost}
                    onChange={e => setShippingCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-cream-200 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-charcoal-500 uppercase font-medium">Free Shipping Threshold *</label>
                  <input
                    type="number"
                    required
                    value={freeShippingThreshold}
                    onChange={e => setFreeShippingThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-cream-200 bg-white"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Payment Gateways */}
          <div className="border border-cream-200 p-4 bg-cream-50/20 space-y-4">
            <h4 className="font-serif text-sm text-charcoal-900 border-b border-cream-100 pb-1.5 uppercase tracking-wider">Enable Payment Methods</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              <div className="flex items-center space-x-3 bg-white p-3 border border-cream-200 shadow-sm">
                <input
                  type="checkbox"
                  id="pay-razorpay"
                  checked={razorpayToggle}
                  onChange={e => setRazorpayToggle(e.target.checked)}
                  className="w-4 h-4 text-teal-800"
                />
                <div>
                  <label htmlFor="pay-razorpay" className="font-bold cursor-pointer text-charcoal-800">Razorpay Integration</label>
                  <span className="block text-[9px] text-charcoal-400 font-sans mt-0.5">UPI, cards and netbanking simulation.</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white p-3 border border-cream-200 shadow-sm">
                <input
                  type="checkbox"
                  id="pay-cod"
                  checked={codToggle}
                  onChange={e => setCodToggle(e.target.checked)}
                  className="w-4 h-4 text-teal-800"
                />
                <div>
                  <label htmlFor="pay-cod" className="font-bold cursor-pointer text-charcoal-800">Cash on Delivery (COD)</label>
                  <span className="block text-[9px] text-charcoal-400 font-sans mt-0.5">Allow payment collection at door.</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white p-3 border border-cream-200 shadow-sm">
                <input
                  type="checkbox"
                  id="pay-whatsapp"
                  checked={whatsappToggle}
                  onChange={e => setWhatsappToggle(e.target.checked)}
                  className="w-4 h-4 text-teal-800"
                />
                <div>
                  <label htmlFor="pay-whatsapp" className="font-bold cursor-pointer text-charcoal-800">Order via WhatsApp</label>
                  <span className="block text-[9px] text-charcoal-400 font-sans mt-0.5">Pre-fill cart links to WhatsApp expert stylist.</span>
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-cream-200">
            <button
              type="submit"
              className="btn-luxury-solid flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Constants Config</span>
            </button>
          </div>

        </form>
      )}

      {/* SUBTAB 2: HERO SLIDER CONFIG */}
      {activeSubTab === 'hero' && (
        <div className="space-y-6 text-xs font-sans">
          
          {heroSlidesState.map((slide, idx) => (
            <div key={slide.id} className="border border-cream-200 p-5 bg-white space-y-4 shadow-sm relative">
              <span className="absolute top-4 right-4 text-[10px] font-mono text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 border border-teal-100">
                Hero Slide {idx + 1}
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Text specs */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-charcoal-500 uppercase font-medium">Hero Heading *</label>
                    <input
                      type="text"
                      required
                      value={slide.heading}
                      onChange={e => handleHeroSlideChange(slide.id, 'heading', e.target.value)}
                      className="w-full px-3 py-2 border border-cream-200 font-serif"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-charcoal-500 uppercase font-medium">Hero Subtitle</label>
                    <textarea
                      rows={2}
                      value={slide.subheading}
                      onChange={e => handleHeroSlideChange(slide.id, 'subheading', e.target.value)}
                      className="w-full px-3 py-2 border border-cream-200 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-charcoal-500 uppercase font-medium">CTA Button Label</label>
                      <input
                        type="text"
                        value={slide.ctaText}
                        onChange={e => handleHeroSlideChange(slide.id, 'ctaText', e.target.value)}
                        className="w-full px-3 py-2 border border-cream-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-charcoal-500 uppercase font-medium">CTA Link Path</label>
                      <input
                        type="text"
                        value={slide.ctaUrl}
                        onChange={e => handleHeroSlideChange(slide.id, 'ctaUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-cream-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Imagery specs */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <label className="text-[10px] text-charcoal-500 uppercase font-medium">Hero Background Image URL *</label>
                    <input
                      type="url"
                      required
                      value={slide.imageUrl}
                      onChange={e => handleHeroSlideChange(slide.id, 'imageUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-cream-200"
                    />
                  </div>

                  <div className="flex items-center space-x-4 pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slide.isActive}
                        onChange={e => handleHeroSlideChange(slide.id, 'isActive', e.target.checked)}
                        className="w-4 h-4 text-teal-800 border-cream-300"
                      />
                      <span className="font-semibold text-charcoal-700 uppercase tracking-wider text-[9px]">Activate this Slide</span>
                    </label>
                  </div>

                  <div className="aspect-[4/1] w-full border border-cream-200 overflow-hidden bg-cream-50">
                    <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>

              </div>

            </div>
          ))}

          <div className="flex justify-end pt-4 border-t border-cream-200">
            <button
              onClick={handleSaveHeroSlides}
              className="btn-luxury-solid flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Hero Slider Configuration</span>
            </button>
          </div>

        </div>
      )}

      {/* SUBTAB 3: CAMPAIGNS BANNERS SCHEDULER */}
      {activeSubTab === 'banners' && (
        <div className="space-y-6 text-xs font-sans">
          
          {bannersState.map((banner, idx) => (
            <div key={banner.id} className="border border-cream-200 p-5 bg-white space-y-4 shadow-sm relative">
              <span className="absolute top-4 right-4 text-[10px] font-mono text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 border border-teal-100">
                Promo Campaign {idx + 1}
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Text specs */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-charcoal-500 uppercase font-medium">Campaign Heading Title *</label>
                    <input
                      type="text"
                      required
                      value={banner.title}
                      onChange={e => handleBannerChange(banner.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-cream-200 font-serif"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-charcoal-500 uppercase font-medium">Start Date Schedule</label>
                      <input
                        type="datetime-local"
                        value={banner.startDate.substring(0, 16)}
                        onChange={e => handleBannerChange(banner.id, 'startDate', new Date(e.target.value).toISOString())}
                        className="w-full px-3 py-2 border border-cream-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-charcoal-500 uppercase font-medium">End Date Schedule</label>
                      <input
                        type="datetime-local"
                        value={banner.endDate.substring(0, 16)}
                        onChange={e => handleBannerChange(banner.id, 'endDate', new Date(e.target.value).toISOString())}
                        className="w-full px-3 py-2 border border-cream-200"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={banner.isActive}
                        onChange={e => handleBannerChange(banner.id, 'isActive', e.target.checked)}
                        className="w-4 h-4 text-teal-800 border-cream-300"
                      />
                      <span className="font-semibold text-charcoal-700 uppercase tracking-wider text-[9px]">Activate Banner Campaign</span>
                    </label>
                  </div>
                </div>

                {/* Banner image preview */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <label className="text-[10px] text-charcoal-500 uppercase font-medium">Banner Background Image URL *</label>
                    <input
                      type="url"
                      required
                      value={banner.imageUrl}
                      onChange={e => handleBannerChange(banner.id, 'imageUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-cream-200"
                    />
                  </div>

                  <div className="aspect-[4/1] w-full border border-cream-200 overflow-hidden bg-cream-50">
                    <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>

              </div>

            </div>
          ))}

          <div className="flex justify-end pt-4 border-t border-cream-200">
            <button
              onClick={handleSaveBanners}
              className="btn-luxury-solid flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Campaign Banners Schedule</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
