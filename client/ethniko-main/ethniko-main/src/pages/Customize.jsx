import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shirt, Scissors, ImagePlus, X, CheckCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MAX_IMAGES = 5;
const MAX_IMAGE_MB = 10; // matches the server's upload limit

// The two kinds of request. `occasion` is what the admin panel uses to file a request under
// "Customization" or "Tailoring" (anything containing "tailoring" is a tailoring request).
const REQUEST_TYPES = {
  outfit: {
    label: "Outfit Customisation",
    icon: Shirt,
    occasion: "Outfit Customization",
    intro: "Tell us the design, colour and fabric you have in mind and we'll bring it to life.",
    notesLabel: "Tell us about your outfit",
    notesPlaceholder: "Describe the design you'd like, the colours, the fabric, the occasion… anything that helps us picture your outfit.",
    done: "outfit customisation",
  },
  tailoring: {
    label: "Tailoring Customisation",
    icon: Scissors,
    occasion: "Custom Tailoring",
    intro: "Fully custom, made from scratch. Share your details and our team will take it from there.",
    notesLabel: "About the outfit you need",
    notesPlaceholder: "Describe what you'd like us to make: the style, fit, length, sleeves, occasion… anything that helps us understand your requirement.",
    done: "tailoring",
  },
};

const EMPTY_FORM = { name: "", phone: "", email: "", address: "", fabricDetails: "", notes: "" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass = (hasError) =>
  `w-full bg-transparent border px-3 py-2.5 text-xs font-sans text-text-custom focus:outline-none focus:border-[#B68D40] ${
    hasError ? 'border-red-500' : 'border-neutral-300'
  }`;

function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">
        {label} {required && <span className="text-[#B68D40]">*</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-red-500 font-sans">{error}</p>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="font-serif text-sm tracking-wider border-b border-neutral-100 pb-2 uppercase text-[#B68D40]">
      {children}
    </h3>
  );
}

export default function Customize() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [requestType, setRequestType] = useState("outfit");
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null); // { id, name, type } once the request has gone through

  const type = REQUEST_TYPES[requestType];
  const isTailoring = requestType === "tailoring";

  // Pre-fill contact details from the signed-in profile when available.
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        phone: prev.phone || user.phone || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  // Thumbnail URLs for the chosen images, released when they change or the page unmounts.
  const previews = useMemo(() => images.map((file) => URL.createObjectURL(file)), [images]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  // Close the confirmation popup with Escape
  useEffect(() => {
    if (!submitted) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setSubmitted(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [submitted]);

  const setField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleTypeChange = (next) => {
    setRequestType(next);
    setErrors({});
  };

  const handleAddImages = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = ""; // lets the same file be chosen again after removing it
    if (picked.length === 0) return;

    const valid = picked.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image.`);
        return false;
      }
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        toast.error(`${file.name} is larger than ${MAX_IMAGE_MB} MB.`);
        return false;
      }
      return true;
    });

    setImages((prev) => {
      const combined = [...prev, ...valid];
      if (combined.length > MAX_IMAGES) {
        toast.error(`You can add up to ${MAX_IMAGES} reference images.`);
      }
      return combined.slice(0, MAX_IMAGES);
    });
  };

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Please enter your name.";
    if (form.phone.replace(/\D/g, "").length < 10) next.phone = "Please enter a valid 10-digit phone number.";
    if (!EMAIL_PATTERN.test(form.email.trim())) next.email = "Please enter a valid email address.";
    if (isTailoring && !form.address.trim()) next.address = "Please enter your address.";
    if (!form.notes.trim()) next.notes = isTailoring ? "Please tell us about the outfit you need." : "Please tell us what you have in mind.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in or register to send your request.");
      navigate("/profile");
      return;
    }

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      const request = await userService.submitCustomizationRequest({
        customerName: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        category: "Custom Request",
        occasion: type.occasion,
        // Tailoring also collects a delivery address and a description of the fabric
        ...(isTailoring && { address: form.address.trim(), fabricPref: form.fabricDetails.trim() }),
        notes: form.notes.trim(),
        images,
      });

      setSubmitted({ id: request.id, name: form.name.trim().split(/\s+/)[0], type: type.done });
      // Start fresh for the next request (contact details stay filled in)
      setForm((prev) => ({ ...EMPTY_FORM, name: prev.name, phone: prev.phone, email: prev.email }));
      setImages([]);
      setErrors({});
    } catch (err) {
      console.error(err);
      // api.js rejects with { message, errors: [{ field, message }] } from the server
      toast.error(err?.errors?.[0]?.message || err?.message || "Submission failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="text-[#181818] min-h-screen bg-fixed bg-no-repeat bg-cover"
      style={{ background: "linear-gradient(180deg, #FBE7C6 0%, #F6EFE3 40%, #E9DCC4 100%)" }}
    >
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">

        {/* Request type toggle */}
        <div className="flex justify-center">
          <div className="inline-flex flex-wrap justify-center border border-[#D9C7A3] rounded-full p-1 gap-1">
            {Object.entries(REQUEST_TYPES).map(([key, t]) => {
              const Icon = t.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTypeChange(key)}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] uppercase tracking-widest font-sans font-bold transition-all duration-300 ${
                    requestType === key
                      ? "bg-[#B68D40] text-white shadow-sm"
                      : "text-neutral-400 hover:text-[#B68D40]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
        <p className="text-center text-[11px] text-neutral-500 font-sans -mt-4">{type.intro}</p>

        {!user && (
          <p className="text-center text-[11px] font-sans text-neutral-500 bg-white/60 border border-[#D9C7A3] px-4 py-3">
            Please <Link to="/profile" className="font-bold text-[#B68D40] underline">sign in or register</Link> to send your request.
          </p>
        )}

        {/* Single-step form */}
        <form onSubmit={handleSubmit} noValidate className="bg-white border border-[#ECECEC] p-8 shadow-sm space-y-8">
          <div className="space-y-5">
            <SectionTitle>Your details</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name" required error={errors.name}>
                <input type="text" value={form.name} onChange={setField("name")} placeholder="Your full name" className={inputClass(errors.name)} />
              </Field>
              <Field label="Phone number" required error={errors.phone}>
                <input type="tel" value={form.phone} onChange={setField("phone")} placeholder="10-digit mobile number" className={inputClass(errors.phone)} />
              </Field>
            </div>
            <Field label="Email" required error={errors.email}>
              <input type="email" value={form.email} onChange={setField("email")} placeholder="you@example.com" className={inputClass(errors.email)} />
            </Field>
            {isTailoring && (
              <Field label="Address" required error={errors.address}>
                <textarea rows={3} value={form.address} onChange={setField("address")} placeholder="House / flat no., street, city, state and pincode" className={inputClass(errors.address)} />
              </Field>
            )}
          </div>

          {isTailoring && (
            <div className="space-y-5">
              <SectionTitle>Fabric</SectionTitle>
              <Field label="Describe the fabric you would like to send">
                <textarea rows={3} value={form.fabricDetails} onChange={setField("fabricDetails")} placeholder="e.g. pure raw silk in emerald green, or the fabric you already have" className={inputClass(false)} />
              </Field>
            </div>
          )}

          <div className="space-y-4">
            <SectionTitle>Reference images</SectionTitle>
            <p className="text-[11px] font-sans text-neutral-400 -mt-2">
              Optional. Add up to {MAX_IMAGES} pictures of designs, colours or styles you like.
            </p>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {previews.map((src, idx) => (
                  <div key={src} className="relative w-20 h-24 border border-neutral-200 shrink-0">
                    <img src={src} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center hover:bg-[#B68D40] focus:outline-none"
                      aria-label={`Remove image ${idx + 1}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < MAX_IMAGES && (
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-neutral-300 py-5 cursor-pointer bg-primary/30 hover:border-[#B68D40] transition-colors">
                <ImagePlus className="w-4 h-4 text-[#B68D40]" />
                <span className="text-[10px] uppercase tracking-widest text-[#B68D40] font-sans font-bold">
                  {images.length === 0 ? "Add images" : "Add more images"} ({images.length}/{MAX_IMAGES})
                </span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleAddImages} />
              </label>
            )}
          </div>

          <div className="space-y-5">
            <SectionTitle>{isTailoring ? "Your requirement" : "Your idea"}</SectionTitle>
            <Field label={type.notesLabel} required error={errors.notes}>
              <textarea rows={6} value={form.notes} onChange={setField("notes")} placeholder={type.notesPlaceholder} className={inputClass(errors.notes)} />
            </Field>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-luxury-solid flex items-center justify-center gap-2 py-3.5 disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? "SUBMITTING..." : "SUBMIT REQUEST"}</span>
          </button>
        </form>
      </div>

      {/* Confirmation popup shown after a request goes through */}
      <AnimatePresence>
        {submitted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="request-sent-title"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white border border-[#D9C7A3] shadow-2xl p-8 text-center space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="w-16 h-16 bg-[#3E7C59]/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-[#3E7C59]" />
              </div>
              <div className="space-y-2">
                <h3 id="request-sent-title" className="font-serif text-2xl tracking-wider uppercase">
                  Thank you, {submitted.name}!
                </h3>
                <p className="text-sm font-sans font-semibold text-[#B68D40]">
                  Our team will reach out to you shortly.
                </p>
                <p className="text-xs font-sans text-neutral-500 leading-relaxed">
                  We've received your {submitted.type} request and will contact you on the phone number or email you shared.
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-sans block">Your reference</span>
                <span className="font-mono text-sm font-semibold text-[#B68D40] tracking-widest bg-primary px-5 py-2 border border-[#D9C7A3] inline-block break-all">
                  {submitted.id}
                </span>
              </div>

              <p className="text-[11px] font-sans text-neutral-500 leading-relaxed bg-[#FBF6EC] border border-[#E6DCCF] px-4 py-3 text-left">
                <span className="font-bold text-neutral-700">Please note:</span> this is a request, not an order, and no payment is needed right now. Our team will confirm the details, pricing and timelines with you when they get in touch.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-1">
                <button type="button" autoFocus onClick={() => navigate('/profile')} className="btn-luxury-solid">
                  View My Requests
                </button>
                <button type="button" onClick={() => setSubmitted(null)} className="btn-luxury">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
