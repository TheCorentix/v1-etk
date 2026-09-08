import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, ImagePlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MAX_IMAGES = 5;

export default function CustomRequestModal({ isOpen, onClose, product }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Prefill contact details from the signed-in profile whenever the modal opens.
  useEffect(() => {
    if (isOpen && user) {
      setName((prev) => prev || user.name || '');
      setPhone((prev) => prev || user.phone || '');
    }
  }, [isOpen, user]);

  const resetForm = () => {
    setName('');
    setPhone('');
    setNotes('');
    setImages([]);
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImages((prev) => {
      const combined = [...prev, ...files];
      if (combined.length > MAX_IMAGES) {
        toast.error(`You can attach up to ${MAX_IMAGES} reference pictures.`);
      }
      return combined.slice(0, MAX_IMAGES);
    });

    // Allow re-selecting the same file after removing it.
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in or register to submit a custom request.');
      onClose();
      navigate('/profile');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit contact number.');
      return;
    }

    if (!notes.trim()) {
      toast.error('Please describe what you\'d like customized.');
      return;
    }

    setLoading(true);
    try {
      await userService.submitCustomizationRequest({
        customerName: name || user.name || 'Client',
        phone,
        email: user.email,
        category: product ? product.category : 'Custom Design Request',
        occasion: 'Product Customization',
        productId: product ? product.id : undefined,
        productSku: product ? product.sku : undefined,
        fabricPref: product ? product.fabric : undefined,
        notes: product ? `Regarding: ${product.name} (SKU: ${product.sku})\n\n${notes}` : notes,
        images,
      });

      toast.success("Request submitted! Our stylist will reach out shortly.");
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Submission failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-lg bg-white border border-[#ECECEC] shadow-2xl z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-[#B68D40] transition-colors focus:outline-none"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#B68D40] font-sans font-semibold">
                  Bespoke Requests
                </span>
                <h3 className="font-serif text-2xl text-neutral-900 tracking-wide">
                  Request a Custom Design
                </h3>
                <p className="text-xs font-sans text-neutral-500 leading-relaxed">
                  Tell us what you'd like changed — fabric, color, sleeve or hand type, length, or anything else — and attach reference pictures if you have them.
                </p>
              </div>

              {product && (
                <div className="flex items-center gap-3 bg-primary/40 border border-[#ECECEC] p-3">
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-12 h-12 object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[8px] uppercase tracking-widest text-neutral-400 font-sans block">Customizing</span>
                    <span className="text-xs font-sans font-semibold text-neutral-800 truncate block">{product.name}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-transparent border border-neutral-300 px-3 py-2 text-xs font-sans text-neutral-800 focus:outline-none focus:border-[#B68D40]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">
                    Phone <span className="text-[#B68D40]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full bg-transparent border border-neutral-300 px-3 py-2 text-xs font-sans text-neutral-800 focus:outline-none focus:border-[#B68D40]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">
                  What would you like customized? <span className="text-[#B68D40]">*</span>
                </label>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    product
                      ? `e.g. Change this ${product.name}'s fabric to raw silk, emerald green color, full sleeves instead of half, floor length instead of ankle length...`
                      : "e.g. Change fabric to raw silk, emerald green color, full sleeves instead of half, floor length instead of ankle length..."
                  }
                  className="w-full bg-transparent border border-neutral-300 px-3 py-2 text-xs font-sans text-neutral-800 focus:outline-none focus:border-[#B68D40]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">
                  Reference Pictures ({images.length}/{MAX_IMAGES})
                </label>

                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {images.map((file, idx) => (
                      <div key={idx} className="relative w-16 h-16 border border-neutral-200 shrink-0">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Reference ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white rounded-full flex items-center justify-center hover:bg-[#B68D40] focus:outline-none"
                          aria-label="Remove image"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length < MAX_IMAGES && (
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-neutral-300 py-4 cursor-pointer bg-primary/30 hover:border-[#B68D40] transition-colors">
                    <ImagePlus className="w-4 h-4 text-[#B68D40]" />
                    <span className="text-[10px] uppercase tracking-widest text-[#B68D40] font-sans font-bold">
                      Add Pictures
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleAddImages}
                    />
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-luxury-solid flex items-center justify-center gap-2 py-3.5"
              >
                <Upload className="w-4 h-4" />
                <span>{loading ? 'SUBMITTING...' : 'SUBMIT REQUEST'}</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
