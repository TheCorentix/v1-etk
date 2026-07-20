import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Ruler, DollarSign, Calendar, FileText, Check, ArrowRight, ArrowLeft, Upload, CheckCircle, Shirt, MapPin, Venus, Mars, Baby, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Step definitions differ slightly by subcategory — step 2's label/content
// changes since "Product Customize" only needs a standard size, while
// "Tailoring Customize" needs full body measurements.
const STEPS_BY_SUBCATEGORY = {
  product: [
    { id: 1, label: "Silhouettes", icon: Scissors },
    { id: 2, label: "Size", icon: Ruler },
    { id: 3, label: "Budget & Dates", icon: Calendar },
    { id: 4, label: "Review & Submit", icon: Check }
  ],
  tailoring: [
    { id: 1, label: "Silhouettes", icon: Scissors },
    { id: 2, label: "Measurements", icon: Ruler },
    { id: 3, label: "Budget & Dates", icon: Calendar },
    { id: 4, label: "Review & Submit", icon: Check }
  ]
};

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// Card-based option data for Step 1 (used by both Product Customize and
// Tailoring Customize, since Step 1 is shared between the two paths).
const SEGMENT_OPTIONS = [
  { value: "WOMEN", label: "Women's Couture", icon: Venus },
  { value: "MEN", label: "Men's Couture", icon: Mars },
  { value: "KIDS", label: "Kids Couture", icon: Baby }
];

const GARMENT_OPTIONS = {
  WOMEN: [
    { value: "Saree", label: "Pre-Draped Saree" },
    { value: "Lehenga", label: "Zardozi Lehenga" },
    { value: "Blouse", label: "Tailored Saree Blouse" },
    { value: "Anarkali", label: "Organza Anarkali" }
  ],
  MEN: [
    { value: "Kurta", label: "Tussar Silk Kurta Set" },
    { value: "Sherwani", label: "Brocade Wedding Sherwani" }
  ],
  KIDS: [
    { value: "Lehenga Frock", label: "Girls Lehenga Frock" },
    { value: "Sherwani Boy", label: "Boys Brocade Sherwani" }
  ]
};

const FABRIC_OPTIONS = ["Chanderi Silk", "Mulberry Silk", "Banarasi Brocade", "Pure Organza", "Raw Silk"];

const COLOR_OPTIONS = [
  { label: "Ivory & Gold", hex: "#E9DFC0" },
  { label: "Terracotta Rust", hex: "#B5651D" },
  { label: "Emerald Green", hex: "#0B6E4F" },
  { label: "Crimson Red", hex: "#A81C1C" },
  { label: "Champagne Gold", hex: "#D4AF7A" }
];

export default function Customize() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 'product' = pick an existing design, customise fabric/color/size
  // 'tailoring' = fully bespoke, made from scratch off the customer's own measurements
  const [subcategory, setSubcategory] = useState("product");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestId, setRequestId] = useState("");

  const STEPS = STEPS_BY_SUBCATEGORY[subcategory];

  // Form State
  const [formData, setFormData] = useState({
    category: "WOMEN",
    garmentType: "Saree",
    fabric: "Chanderi Silk",
    color: "Gold",
    // Product Customize path
    size: "M",
    needsAlteration: false,
    alterationNotes: "",
    // Tailoring Customize path
    measurements: {
      bust: "",
      waist: "",
      hips: "",
      height: "",
      shoulder: "",
      custom: ""
    },
    fittingPreference: "Studio Visit",
    specialRequests: "",
    budget: "₹10,000 – ₹20,000",
    preferredDate: "",
    referenceImage: null
  });

  const handleSubcategoryChange = (next) => {
    setSubcategory(next);
    setStep(1); // reset wizard whenever the customer switches paths
  };

  const handleNext = () => {
    if (step < 4) setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in or register to submit custom requests.");
      navigate("/profile");
      return;
    }

    setLoading(true);

    const isTailoring = subcategory === "tailoring";

    const requestPayload = {
      customerName: user.name || "Client",
      phone: user.phone || "9999999999", // Fallback standard required 10-digit phone
      email: user.email,
      category: formData.garmentType,
      occasion: isTailoring ? "Bespoke Custom Tailoring" : "Silhouettes Customization",
      fabricPref: formData.fabric,
      colorPref: formData.color,
      budgetRange: formData.budget,
      deliveryDate: formData.preferredDate,
      notes: isTailoring
        ? `Bust: ${formData.measurements.bust} | Waist: ${formData.measurements.waist} | Hips: ${formData.measurements.hips} | Height: ${formData.measurements.height} | Shoulder: ${formData.measurements.shoulder} | Custom Notes: ${formData.measurements.custom || 'None'} | Preference: ${formData.fittingPreference}`
        : `Selected Standard Size: ${formData.size} | Alterations: ${formData.needsAlteration ? 'Yes' : 'No'} (${formData.alterationNotes || 'None'})`,
      images: formData.referenceImage ? [formData.referenceImage] : [],
    };

    try {
      const res = await userService.submitCustomizationRequest(requestPayload);
      setRequestId(res.id);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error("Submission failed. Please check that you entered a valid phone number and all required fields.");
    } finally {
      setLoading(false);
    }
  };

  const handleMockUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, referenceImage: e.target.files[0] });
    }
  };

  return (
    <div
      className="text-[#181818] min-h-screen bg-fixed bg-no-repeat bg-cover"
      style={{ background: "linear-gradient(180deg, #FBE7C6 0%, #F6EFE3 40%, #E9DCC4 100%)" }}
    >
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">

      {success ? (
        /* Success Screen */
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-primary dark:bg-neutral-900 border border-[#D9C7A3] p-12 text-center space-y-6"
        >
          <div className="w-16 h-16 bg-[#3E7C59]/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-[#3E7C59]" />
          </div>
          <h3 className="font-serif text-2xl text-text-custom dark:text-primary tracking-wider">REQUEST SUBMITTED</h3>
          <p className="text-xs text-neutral-500 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
            Your {subcategory === "tailoring" ? "bespoke tailoring" : "customized"} dossier has been registered at the ETNIKO Atelier under reference:
          </p>
          <span className="font-mono text-sm font-semibold text-[#B68D40] tracking-widest bg-white dark:bg-neutral-800 px-6 py-2.5 border border-[#D9C7A3] inline-block">
            {requestId}
          </span>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Our atelier stylist will contact you on WhatsApp within 12 hours to verify {subcategory === "tailoring" ? "measurements" : "sizing"} and review color swatches.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => {
                setSuccess(false);
                setStep(1);
                navigate('/profile');
              }}
              className="btn-luxury-solid"
            >
              View Styling Requests
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="btn-luxury"
            >
              Browse Collections
            </button>
          </div>
        </motion.div>
      ) : (
        /* Form Wizard */
        <div className="space-y-10">

          {/* Subcategory Toggle — Product Customize vs Tailoring Customize */}
          <div className="flex justify-center">
            <div className="inline-flex border border-[#D9C7A3] rounded-full p-1 gap-1">
              <button
                onClick={() => handleSubcategoryChange("product")}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] uppercase tracking-widest font-sans font-bold transition-all duration-300 ${
                  subcategory === "product"
                    ? "bg-[#B68D40] text-white shadow-sm"
                    : "text-neutral-400 hover:text-[#B68D40]"
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                Product Customize
              </button>
              <button
                onClick={() => handleSubcategoryChange("tailoring")}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] uppercase tracking-widest font-sans font-bold transition-all duration-300 ${
                  subcategory === "tailoring"
                    ? "bg-[#B68D40] text-white shadow-sm"
                    : "text-neutral-400 hover:text-[#B68D40]"
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                Tailoring Customize
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] text-neutral-400 -mt-6 font-sans">
            {subcategory === "product"
              ? "Start from an existing ETNIKO design and personalise fabric, color and size."
              : "Fully bespoke — made from scratch to your own measurements."}
          </p>

          {/* Progress Indicator line */}
          <div className="relative flex justify-between items-center max-w-2xl mx-auto">
            <div className="absolute inset-x-0 h-0.5 bg-neutral-200 dark:bg-neutral-850 -z-10" />
            <div
              style={{ width: `${((step - 1) / 3) * 100}%` }}
              className="absolute h-0.5 bg-[#B68D40] transition-all duration-500 -z-10"
            />
            {STEPS.map((s) => {
              const active = step === s.id;
              const done = step > s.id;
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border text-xs font-semibold font-sans transition-all duration-500 ${
                      done
                        ? 'bg-[#B68D40] border-[#B68D40] text-white shadow-sm'
                        : active
                        ? 'bg-white border-[#B68D40] text-[#B68D40] shadow-md ring-4 ring-primary'
                        : 'bg-white dark:bg-neutral-850 border-neutral-200 text-neutral-400'
                    }`}
                  >
                    {done ? "✓" : s.id}
                  </div>
                  <span className={`text-[8px] uppercase tracking-widest font-sans font-bold ${
                    active ? 'text-[#B68D40]' : 'text-neutral-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Form Step Components */}
          <div className="bg-white dark:bg-[#181818] border border-[#ECECEC] dark:border-neutral-800 p-8 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${subcategory}-${step}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* STEP 1: SILHOUETTES & COLOR SELECTIONS (shared by both paths) */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-lg tracking-wider border-b border-neutral-100 pb-3 uppercase text-[#B68D40]">
                      Garment & Swatch Options
                    </h3>

                    <div className="space-y-6">
                      {/* Client Segment — card grid */}
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">Client Segment</label>
                        <div className="grid grid-cols-3 gap-3">
                          {SEGMENT_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            const selected = formData.category === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  category: opt.value,
                                  garmentType: GARMENT_OPTIONS[opt.value][0].value
                                })}
                                className={`flex flex-col items-center gap-2 border px-3 py-4 text-center transition-all duration-200 ${
                                  selected
                                    ? 'bg-[#B68D40] border-[#B68D40] text-white'
                                    : 'bg-transparent border-neutral-300 dark:border-neutral-700 text-text-custom dark:text-white hover:border-[#B68D40]'
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] uppercase tracking-widest font-sans font-bold">{opt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Garment Silhouette — card grid, options depend on segment */}
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">Garment Silhouette</label>
                        <div className="grid grid-cols-2 gap-3">
                          {GARMENT_OPTIONS[formData.category].map((opt) => {
                            const selected = formData.garmentType === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, garmentType: opt.value })}
                                className={`border px-3 py-3 text-left text-xs font-sans transition-all duration-200 ${
                                  selected
                                    ? 'bg-[#B68D40] border-[#B68D40] text-white font-semibold'
                                    : 'bg-transparent border-neutral-300 dark:border-neutral-700 text-text-custom dark:text-white hover:border-[#B68D40]'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Base Fabric Swatch — card grid */}
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">Base Fabric Swatch</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {FABRIC_OPTIONS.map((fab) => {
                            const selected = formData.fabric === fab;
                            return (
                              <button
                                key={fab}
                                type="button"
                                onClick={() => setFormData({ ...formData, fabric: fab })}
                                className={`flex items-center gap-2 border px-3 py-3 text-xs font-sans transition-all duration-200 ${
                                  selected
                                    ? 'bg-[#B68D40] border-[#B68D40] text-white font-semibold'
                                    : 'bg-transparent border-neutral-300 dark:border-neutral-700 text-text-custom dark:text-white hover:border-[#B68D40]'
                                }`}
                              >
                                <Layers className="w-3.5 h-3.5 shrink-0" />
                                {fab}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Color Preference — card grid with swatch dot */}
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">Color Preference</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {COLOR_OPTIONS.map((c) => {
                            const selected = formData.color === c.label;
                            return (
                              <button
                                key={c.label}
                                type="button"
                                onClick={() => setFormData({ ...formData, color: c.label })}
                                className={`flex items-center gap-2 border px-3 py-3 text-xs font-sans transition-all duration-200 ${
                                  selected
                                    ? 'border-[#B68D40] bg-[#B68D40]/10 text-[#B68D40] font-semibold'
                                    : 'bg-transparent border-neutral-300 dark:border-neutral-700 text-text-custom dark:text-white hover:border-[#B68D40]'
                                }`}
                              >
                                <span
                                  className="w-4 h-4 rounded-full border border-neutral-400 shrink-0"
                                  style={{ backgroundColor: c.hex }}
                                />
                                {c.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2 — PRODUCT CUSTOMIZE: standard size, no measurements needed */}
                {step === 2 && subcategory === "product" && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-lg tracking-wider border-b border-neutral-100 pb-3 uppercase text-[#B68D40]">
                      Standard Sizing
                    </h3>

                    <div className="bg-primary dark:bg-neutral-900 border border-border-custom p-4 text-[11px] font-sans text-neutral-500 leading-relaxed text-justify">
                      <span className="font-bold text-[#B68D40] uppercase tracking-widest block mb-1">Sizing Note:</span>
                      This design is made from an existing ETNIKO pattern, so a standard size is usually all we need. If you'd like small alterations, flag it below and share the 1-2 measurements that matter.
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">Select Size</label>
                      <div className="flex flex-wrap gap-2">
                        {STANDARD_SIZES.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setFormData({ ...formData, size: sz })}
                            className={`w-11 h-11 border text-xs font-sans font-semibold transition-all duration-200 ${
                              formData.size === sz
                                ? 'bg-[#B68D40] border-[#B68D40] text-white'
                                : 'bg-transparent border-neutral-300 dark:border-neutral-700 text-text-custom dark:text-white hover:border-[#B68D40]'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-sans font-bold text-neutral-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.needsAlteration}
                        onChange={(e) => setFormData({ ...formData, needsAlteration: e.target.checked })}
                        className="accent-[#B68D40] w-3.5 h-3.5"
                      />
                      Need minor alterations?
                    </label>

                    {formData.needsAlteration && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Bust (inches)</label>
                          <input
                            type="text"
                            placeholder="e.g. 34"
                            value={formData.measurements.bust}
                            onChange={(e) => setFormData({
                              ...formData,
                              measurements: { ...formData.measurements, bust: e.target.value }
                            })}
                            className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-text-custom dark:text-white focus:outline-none focus:border-[#B68D40]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Waist (inches)</label>
                          <input
                            type="text"
                            placeholder="e.g. 28"
                            value={formData.measurements.waist}
                            onChange={(e) => setFormData({
                              ...formData,
                              measurements: { ...formData.measurements, waist: e.target.value }
                            })}
                            className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-text-custom dark:text-white focus:outline-none focus:border-[#B68D40]"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">Alteration notes (optional)</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Take in the waist slightly, lengthen sleeves by 1 inch..."
                        value={formData.alterationNotes}
                        onChange={(e) => setFormData({ ...formData, alterationNotes: e.target.value })}
                        className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-text-custom dark:text-white focus:outline-none focus:border-[#B68D40]"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2 — TAILORING CUSTOMIZE: full measurements + fitting preference */}
                {step === 2 && subcategory === "tailoring" && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-lg tracking-wider border-b border-neutral-100 pb-3 uppercase text-[#B68D40]">
                      Tailoring Sizing Measurements
                    </h3>

                    <div className="bg-primary dark:bg-neutral-900 border border-border-custom p-4 text-[11px] font-sans text-neutral-500 leading-relaxed text-justify">
                      <span className="font-bold text-[#B68D40] uppercase tracking-widest block mb-1">Tailoring Note:</span>
                      For a perfect draping silhouette, we recommend using a standard tailor tape. Wrap the tape comfortably (not too tight) around the bust, natural waist, and hips. If unsure, you may submit approximations; our stylist will finalize sizing with you.
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Bust (inches)</label>
                        <input
                          type="text"
                          placeholder="e.g. 34"
                          value={formData.measurements.bust}
                          onChange={(e) => setFormData({
                            ...formData,
                            measurements: { ...formData.measurements, bust: e.target.value }
                          })}
                          className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-text-custom dark:text-white focus:outline-none focus:border-[#B68D40]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Waist (inches)</label>
                        <input
                          type="text"
                          placeholder="e.g. 28"
                          value={formData.measurements.waist}
                          onChange={(e) => setFormData({
                            ...formData,
                            measurements: { ...formData.measurements, waist: e.target.value }
                          })}
                          className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-text-custom dark:text-white focus:outline-none focus:border-[#B68D40]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Hips (inches)</label>
                        <input
                          type="text"
                          placeholder="e.g. 38"
                          value={formData.measurements.hips}
                          onChange={(e) => setFormData({
                            ...formData,
                            measurements: { ...formData.measurements, hips: e.target.value }
                          })}
                          className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-text-custom dark:text-white focus:outline-none focus:border-[#B68D40]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Shoulders (inches)</label>
                        <input
                          type="text"
                          placeholder="e.g. 14.5"
                          value={formData.measurements.shoulder}
                          onChange={(e) => setFormData({
                            ...formData,
                            measurements: { ...formData.measurements, shoulder: e.target.value }
                          })}
                          className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-text-custom dark:text-white focus:outline-none focus:border-[#B68D40]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Height (ft/in)</label>
                        <input
                          type="text"
                          placeholder="e.g. 5ft 6in"
                          value={formData.measurements.height}
                          onChange={(e) => setFormData({
                            ...formData,
                            measurements: { ...formData.measurements, height: e.target.value }
                          })}
                          className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-text-custom dark:text-white focus:outline-none focus:border-[#B68D40]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">Custom fit preferences / Special sizing notes</label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Blouse neck cuts, specific sleeve lengths, drape tightness preference..."
                        value={formData.measurements.custom}
                        onChange={(e) => setFormData({
                          ...formData,
                          measurements: { ...formData.measurements, custom: e.target.value }
                        })}
                        className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-text-custom dark:text-white focus:outline-none focus:border-[#B68D40]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">Fitting Preference</label>
                      <div className="flex flex-wrap gap-2">
                        {["Studio Visit", "Home Visit", "Measurements Only"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setFormData({ ...formData, fittingPreference: opt })}
                            className={`flex items-center gap-1.5 px-3.5 py-2 text-[10px] uppercase tracking-widest font-sans font-bold border transition-all duration-200 ${
                              formData.fittingPreference === opt
                                ? 'bg-[#B68D40] border-[#B68D40] text-white'
                                : 'bg-transparent border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:border-[#B68D40]'
                            }`}
                          >
                            <MapPin className="w-3 h-3" />
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: BUDGET & DELIVERIES (shared, reference image required for tailoring) */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-lg tracking-wider border-b border-neutral-100 pb-3 uppercase text-[#B68D40]">
                      Budget & Timeline Guidelines
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">Estimated Budget Range</label>
                        <select
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 px-3 py-2.5 text-xs font-sans text-text-custom dark:text-white focus:outline-none focus:border-[#B68D40]"
                        >
                          <option value="₹5,000 – ₹10,000">₹5,000 – ₹10,000</option>
                          <option value="₹10,000 – ₹20,000">₹10,000 – ₹20,000</option>
                          <option value="₹20,000 – ₹35,000">₹20,000 – ₹35,000</option>
                          <option value="Above ₹35,000">Above ₹35,000 (Luxury couture)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">Target Delivery Date</label>
                        <input
                          type="date"
                          value={formData.preferredDate}
                          onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                          className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-neutral-500 focus:outline-none focus:border-[#B68D40]"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">
                          References & Sketch Uploads {subcategory === "tailoring" && <span className="text-[#B68D40]">*</span>}
                        </label>

                        <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-750 p-6 flex flex-col items-center justify-center space-y-2 bg-primary/30">
                          <Upload className="w-8 h-8 text-[#B68D40] opacity-80" />
                          <div className="text-center">
                            <label className="cursor-pointer text-[10px] tracking-widest text-[#B68D40] uppercase font-bold hover:text-black">
                              Select Image File
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleMockUpload}
                              />
                            </label>
                            <span className="text-[9px] font-sans text-neutral-400 block mt-1">
                              {subcategory === "tailoring"
                                ? "Required — show us what to stitch. PNG, JPG up to 10MB"
                                : "Optional inspiration. PNG, JPG up to 10MB"}
                            </span>
                          </div>
                        </div>

                        {formData.referenceImage && (
                          <p className="text-[10px] uppercase tracking-widest text-[#3E7C59] font-bold text-center">
                            ✓ Reference Selected: {formData.referenceImage}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">Styling / Embroidery Guidelines</label>
                        <textarea
                          rows={3}
                          placeholder="Describe your design vision: Gota work density, motif choices, dupatta lengths, or embroidery wishes..."
                          value={formData.specialRequests}
                          onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                          className="w-full bg-transparent border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-text-custom dark:text-white focus:outline-none focus:border-[#B68D40]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: REVIEW & CONFIRM (shows size grid or measurements dossier depending on path) */}
                {step === 4 && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-lg tracking-wider border-b border-neutral-100 pb-3 uppercase text-[#B68D40]">
                      Review Dossier Submission
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-sans leading-relaxed text-neutral-600 dark:text-neutral-300">

                      <div className="space-y-4">
                        <h4 className="text-[9px] tracking-widest text-[#B68D40] font-sans font-bold uppercase border-b pb-1">
                          Silhouette Selections
                        </h4>
                        <div className="space-y-1">
                          <p><span className="text-neutral-400">Garment Type:</span> <span className="font-bold text-text-custom dark:text-primary">{formData.garmentType} ({formData.category})</span></p>
                          <p><span className="text-neutral-400">Fabric Swatch:</span> <span className="font-bold text-text-custom dark:text-primary">{formData.fabric}</span></p>
                          <p><span className="text-neutral-400">Color Choice:</span> <span className="font-bold text-text-custom dark:text-primary">{formData.color}</span></p>
                        </div>

                        <h4 className="text-[9px] tracking-widest text-[#B68D40] font-sans font-bold uppercase border-b pb-1 pt-2">
                          Budget & Schedule
                        </h4>
                        <div className="space-y-1">
                          <p><span className="text-neutral-400">Estimate Budget:</span> <span className="font-bold text-text-custom dark:text-primary">{formData.budget}</span></p>
                          <p><span className="text-neutral-400">Delivery Date:</span> <span className="font-bold text-text-custom dark:text-primary">{formData.preferredDate || "Open Timeline"}</span></p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {subcategory === "product" ? (
                          <>
                            <h4 className="text-[9px] tracking-widest text-[#B68D40] font-sans font-bold uppercase border-b pb-1">
                              Sizing
                            </h4>
                            <div className="bg-primary dark:bg-neutral-900 p-3.5 border border-neutral-200 text-center">
                              <span className="text-neutral-400 text-[8px] uppercase block">Standard Size</span>
                              <span className="font-bold text-lg text-text-custom dark:text-primary">{formData.size}</span>
                            </div>
                            {formData.needsAlteration && (
                              <p className="text-[10px] text-neutral-500">
                                Alterations requested — Bust {formData.measurements.bust || "—"}", Waist {formData.measurements.waist || "—"}"
                              </p>
                            )}
                            {formData.alterationNotes && (
                              <p className="text-[10px] text-neutral-500 italic">"{formData.alterationNotes}"</p>
                            )}
                          </>
                        ) : (
                          <>
                            <h4 className="text-[9px] tracking-widest text-[#B68D40] font-sans font-bold uppercase border-b pb-1">
                              Measurements dossier
                            </h4>
                            <div className="grid grid-cols-3 gap-2 text-center bg-primary dark:bg-neutral-900 p-3.5 border border-neutral-200">
                              <div>
                                <span className="text-neutral-400 text-[8px] uppercase block">Bust</span>
                                <span className="font-bold text-text-custom dark:text-primary">{formData.measurements.bust || "—"}</span>
                              </div>
                              <div>
                                <span className="text-neutral-400 text-[8px] uppercase block">Waist</span>
                                <span className="font-bold text-text-custom dark:text-primary">{formData.measurements.waist || "—"}</span>
                              </div>
                              <div>
                                <span className="text-neutral-400 text-[8px] uppercase block">Hips</span>
                                <span className="font-bold text-text-custom dark:text-primary">{formData.measurements.hips || "—"}</span>
                              </div>
                            </div>
                            <p className="text-[10px] text-neutral-500">
                              Fitting: <span className="font-bold text-text-custom dark:text-primary">{formData.fittingPreference}</span>
                            </p>
                            {formData.measurements.custom && (
                              <p className="text-[10px] text-neutral-500 italic mt-1">"{formData.measurements.custom}"</p>
                            )}
                          </>
                        )}
                        {formData.specialRequests && (
                          <div className="pt-2">
                            <span className="text-neutral-400 text-[9px] uppercase tracking-wider block">Design guidelines:</span>
                            <p className="italic text-neutral-500">"{formData.specialRequests}"</p>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls bottom */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-sans font-bold text-neutral-400 hover:text-black disabled:opacity-30 focus:outline-none"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 btn-luxury-solid"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-luxury-solid flex items-center gap-2"
              >
                <span>{loading ? "REGISTERING DESIGN WIZARD..." : "FINALIZE ATELIER Dossier"}</span>
              </button>
            )}
          </div>

        </div>
      )}

      </div>
    </div>
  );
}
