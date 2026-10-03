import React, { useState } from 'react';
import { Plus, AlertCircle, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../../services/productService';
import MediaLibraryDialog from './MediaLibraryDialog';

// Builds the editable form state from a product as returned by productService
// (prices already converted to Rupees).
const toFormState = (p) => ({
  name: p.name || '',
  category: p.category || 'WOMEN',
  subcategory: p.subcategory || '',
  price: p.price ?? '',
  discountPrice: p.discountPrice ?? '',
  fabric: p.fabric || '',
  colors: (p.colors || []).join(', '),
  weight: p.weight ?? '',
  type: p.type || 'READY_TO_WEAR',
  status: p.status || 'DRAFT',
  description: p.description || '',
  story: p.story || '',
  care: p.care || '',
  images: [...(p.images || [])],
  // Legacy products store sizes as a plain array; start those at 0 stock.
  sizeRows: p.sizeStock
    ? Object.entries(p.sizeStock).map(([size, stock]) => ({ size, stock }))
    : (p.sizes || []).map((size) => ({ size, stock: 0 })),
});

const inputClass = (hasError) =>
  `w-full bg-white border px-3 py-2 text-xs font-sans text-text-custom focus:outline-none ${hasError ? 'border-red-500' : 'border-neutral-300'}`;

const Label = ({ children }) => (
  <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">{children}</label>
);

export default function ProductEditModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(() => toFormState(product));
  const [sizesDirty, setSizesDirty] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const updateSizeRow = (index, field, value) => {
    const sizeRows = form.sizeRows.map((row, i) => (i === index ? { ...row, [field]: value } : row));
    setForm({ ...form, sizeRows });
    setSizesDirty(true);
  };
  const addSizeRow = () => {
    setForm({ ...form, sizeRows: [...form.sizeRows, { size: '', stock: 0 }] });
    setSizesDirty(true);
  };
  const removeSizeRow = (index) => {
    setForm({ ...form, sizeRows: form.sizeRows.filter((_, i) => i !== index) });
    setSizesDirty(true);
  };

  const moveImage = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= form.images.length) return;
    const images = [...form.images];
    [images[index], images[target]] = [images[target], images[index]];
    setForm({ ...form, images });
  };
  const removeImage = (index) => setForm({ ...form, images: form.images.filter((_, i) => i !== index) });

  // Mirrors the backend updateProductSchema so problems show inline before saving.
  const validate = () => {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!form.subcategory.trim()) errs.subcategory = 'Subcategory is required.';
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) errs.price = 'Enter a valid price greater than 0.';
    if (form.discountPrice !== '' && form.discountPrice !== null) {
      const discount = parseFloat(form.discountPrice);
      if (isNaN(discount) || discount < 0) errs.discountPrice = 'Enter a valid discount price.';
      else if (discount >= price) errs.discountPrice = 'Discount price must be lower than the price.';
    }
    if (form.fabric.trim().length < 2) errs.fabric = 'Fabric must be at least 2 characters.';
    if (form.description.trim().length < 5) errs.description = 'Description must be at least 5 characters.';
    if (form.colors.split(',').map((c) => c.trim()).filter(Boolean).length === 0) {
      errs.colors = 'Enter at least one color (comma-separated).';
    }
    if (sizesDirty) {
      const labels = form.sizeRows.map((r) => r.size.trim());
      if (labels.some((l) => !l)) errs.sizes = 'Every size needs a label.';
      else if (new Set(labels).size !== labels.length) errs.sizes = 'Size labels must be unique.';
      else if (form.sizeRows.some((r) => isNaN(parseInt(r.stock, 10)) || parseInt(r.stock, 10) < 0)) {
        errs.sizes = 'Stock must be 0 or more for every size.';
      }
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      subcategory: form.subcategory.trim(),
      price: Math.round(parseFloat(form.price) * 100), // Rupees -> Paise
      discountPrice: form.discountPrice === '' || form.discountPrice === null
        ? null
        : Math.round(parseFloat(form.discountPrice) * 100),
      fabric: form.fabric.trim(),
      colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
      type: form.type,
      status: form.status,
      description: form.description.trim(),
      story: form.story,
      care: form.care,
      imageUrls: form.images,
    };
    if (form.weight !== '' && form.weight !== null) payload.weight = parseFloat(form.weight);
    // Only send sizes when touched, so legacy products don't get their stock reset to 0.
    if (sizesDirty) {
      payload.sizes = form.sizeRows.reduce((acc, row) => {
        acc[row.size.trim()] = parseInt(row.stock, 10);
        return acc;
      }, {});
    }

    setSaving(true);
    try {
      await productService.updateProduct(product.id, payload);
      toast.success('Product updated.');
      onSaved();
    } catch (err) {
      console.error(err);
      if (err && Array.isArray(err.errors) && err.errors.length > 0) {
        const mapped = {};
        err.errors.forEach((er) => {
          const field = (er.field || '').replace(/^body\./, '');
          if (field) mapped[field] = er.message;
        });
        setErrors((prev) => ({ ...prev, ...mapped }));
        toast.error(err.errors[0].message || 'Validation failed. Check the highlighted fields.');
      } else {
        toast.error(err?.message || 'Failed to update product.');
      }
    } finally {
      setSaving(false);
    }
  };

  const totalStock = form.sizeRows.reduce((sum, r) => sum + (parseInt(r.stock, 10) || 0), 0);

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white border border-[#D9C7A3] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-4 p-5 border-b border-neutral-200 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-serif text-lg tracking-wider text-neutral-900">Edit Garment</h3>
            <span className="font-mono text-[11px] text-[#B68D40]">{product.sku || 'SKU —'}</span>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 text-xl leading-none" aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          {Object.keys(errors).length > 0 && (
            <div className="md:col-span-2 flex items-start gap-2.5 border border-red-300 bg-red-50 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <ul className="space-y-0.5 list-disc list-inside">
                {Object.values(errors).map((msg, i) => (
                  <li key={i} className="text-[10px] font-sans text-red-500">{msg}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-1">
            <Label>Garment Name</Label>
            <input type="text" value={form.name} onChange={set('name')} className={inputClass(errors.name)} />
            {form.name.trim() !== product.name && (
              <p className="text-[9px] text-neutral-400 font-sans">Renaming changes the storefront URL.</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>SKU Code</Label>
            <input type="text" value={product.sku || ''} disabled className="w-full bg-neutral-100 border border-neutral-200 px-3 py-2 text-xs font-mono text-neutral-500" />
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <select value={form.category} onChange={set('category')} className={`${inputClass(false)} py-2.5`}>
              <option value="WOMEN">WOMEN</option>
              <option value="MEN">MEN</option>
              <option value="KIDS">KIDS</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Subcategory</Label>
            <input type="text" value={form.subcategory} onChange={set('subcategory')} className={inputClass(errors.subcategory)} />
          </div>
          <div className="space-y-1">
            <Label>Price (INR)</Label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} className={inputClass(errors.price)} />
          </div>
          <div className="space-y-1">
            <Label>Discount Price (INR) <span className="normal-case">— leave empty for none</span></Label>
            <input type="number" min="0" step="0.01" value={form.discountPrice} onChange={set('discountPrice')} className={inputClass(errors.discountPrice)} />
          </div>
          <div className="space-y-1">
            <Label>Fabric</Label>
            <input type="text" value={form.fabric} onChange={set('fabric')} className={inputClass(errors.fabric)} />
          </div>
          <div className="space-y-1">
            <Label>Colors <span className="normal-case">(comma-separated)</span></Label>
            <input type="text" value={form.colors} onChange={set('colors')} className={inputClass(errors.colors)} />
          </div>
          <div className="space-y-1">
            <Label>Weight <span className="normal-case">(kg)</span></Label>
            <input type="number" min="0" step="0.1" value={form.weight} onChange={set('weight')} className={inputClass(false)} />
          </div>
          <div className="space-y-1">
            <Label>Garment Type</Label>
            <select value={form.type} onChange={set('type')} className={`${inputClass(false)} py-2.5`}>
              <option value="READY_TO_WEAR">Ready to Wear</option>
              <option value="CUSTOM_MADE">Custom Made</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Publish Status</Label>
            <select value={form.status} onChange={set('status')} className={`${inputClass(false)} py-2.5`}>
              <option value="PUBLISHED">Published (visible in shop)</option>
              <option value="DRAFT">Draft (hidden)</option>
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label>Garment Description</Label>
            <textarea rows={3} value={form.description} onChange={set('description')} className={inputClass(errors.description)} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Story</Label>
            <textarea rows={2} value={form.story} onChange={set('story')} className={inputClass(false)} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Care Instructions</Label>
            <textarea rows={2} value={form.care} onChange={set('care')} className={inputClass(false)} />
          </div>

          {/* Stock per size */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex justify-between items-center">
              <Label>Stock per Size <span className="normal-case">— total {totalStock} units</span></Label>
              <button type="button" onClick={addSizeRow} className="text-[9px] uppercase tracking-widest text-[#B68D40] hover:text-black font-bold flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Size
              </button>
            </div>
            <div className={`bg-white border p-3 space-y-2 ${errors.sizes ? 'border-red-500' : ''}`}>
              {form.sizeRows.length === 0 && (
                <p className="text-[10px] text-neutral-400 font-sans">No sizes yet.</p>
              )}
              {form.sizeRows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={row.size}
                    placeholder="Size (e.g. M)"
                    onChange={(e) => updateSizeRow(i, 'size', e.target.value)}
                    className="w-28 bg-white border border-neutral-300 px-2 py-1.5 text-xs font-sans focus:outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    value={row.stock}
                    onChange={(e) => updateSizeRow(i, 'stock', e.target.value)}
                    className="w-24 bg-white border border-neutral-300 px-2 py-1.5 text-xs font-sans focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-400 font-sans">units</span>
                  <button type="button" onClick={() => removeSizeRow(i)} className="ml-auto p-1 text-neutral-400 hover:text-[#B42318]" aria-label="Remove size">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {!product.sizeStock && !sizesDirty && (
              <p className="text-[9px] text-neutral-400 font-sans">
                This product has no per-size stock yet. Its stock stays as-is unless you edit the sizes above.
              </p>
            )}
          </div>

          {/* Images */}
          <div className="space-y-2 md:col-span-2">
            <Label>Garment Showcase Images <span className="normal-case">— first image is the main one</span></Label>
            <div className="flex flex-wrap gap-3 items-start bg-white p-3 border">
              {form.images.map((img, i) => (
                <div key={`${img}-${i}`} className="w-16 space-y-1">
                  <div className="relative w-16 h-20 border">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[8px]"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="p-0.5 text-neutral-400 hover:text-black disabled:opacity-30" aria-label="Move left">
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} className="p-0.5 text-neutral-400 hover:text-black disabled:opacity-30" aria-label="Move right">
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setMediaOpen(true)}
                className="w-16 h-20 border border-dashed flex flex-col items-center justify-center text-neutral-400 hover:text-[#B68D40] hover:border-[#B68D40]"
              >
                <Plus className="w-4 h-4" />
                <span className="text-[6.5px] uppercase font-bold pt-1">Add Image</span>
              </button>
            </div>
          </div>

          <div className="md:col-span-2 flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-neutral-300 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-600 hover:bg-neutral-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-luxury-solid flex-1 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>

    {/* Rendered outside the overlay so clicks inside it don't close the edit modal */}
    <MediaLibraryDialog
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url) => {
          setForm((f) => ({ ...f, images: [...f.images, url] }));
          setMediaOpen(false);
        }}
        activeFolder="products"
      />
    </>
  );
}
