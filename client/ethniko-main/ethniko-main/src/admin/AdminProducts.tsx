import React, { useState } from 'react';
import { Plus, Edit, Trash2, ShieldAlert, Check, Image, Video, X } from 'lucide-react';
import { useEtnikoStore } from '../store/useEtnikoStore';
import { Product, ProductSize } from '../types/schema';

export const AdminProducts: React.FC = () => {
  const products = useEtnikoStore(state => state.products);
  const addProduct = useEtnikoStore(state => state.addProduct);
  const updateProduct = useEtnikoStore(state => state.updateProduct);
  const deleteProduct = useEtnikoStore(state => state.deleteProduct);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('WOMEN');
  const [subcategory, setSubcategory] = useState('Handloom Sarees');
  const [price, setPrice] = useState(0);
  const [compareAtPrice, setCompareAtPrice] = useState(0);
  const [fabric, setFabric] = useState('');
  const [colors, setColors] = useState('');
  const [customizationAvailable, setCustomizationAvailable] = useState(true);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  
  // Media states
  const [imageUrl1, setImageUrl1] = useState('');
  const [imageUrl2, setImageUrl2] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Sizes stocks state
  const [sizesList, setSizesList] = useState<ProductSize[]>([
    { size: 'S', stock: 5 },
    { size: 'M', stock: 10 },
    { size: 'L', stock: 5 }
  ]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategory('WOMEN');
    setSubcategory('Handloom Sarees');
    setPrice(0);
    setCompareAtPrice(0);
    setFabric('');
    setColors('');
    setCustomizationAvailable(true);
    setStatus('published');
    setImageUrl1('');
    setImageUrl2('');
    setVideoUrl('');
    setSizesList([
      { size: 'S', stock: 5 },
      { size: 'M', stock: 10 },
      { size: 'L', stock: 5 }
    ]);
    setValidationError(null);
    setShowForm(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setCategory(product.category);
    setSubcategory(product.subcategory);
    setPrice(product.price);
    setCompareAtPrice(product.compareAtPrice || 0);
    setFabric(product.fabric);
    setColors(product.colors.join(', '));
    setCustomizationAvailable(product.customizationAvailable);
    setStatus(product.status === 'soldout' ? 'published' : product.status);
    setImageUrl1(product.images[0] || '');
    setImageUrl2(product.images[1] || '');
    setVideoUrl(product.video || '');
    setSizesList([...product.sizes]);
    setValidationError(null);
    setShowForm(true);
  };

  const handleSizeStockChange = (idx: number, stockVal: number) => {
    const updated = [...sizesList];
    updated[idx].stock = Math.max(0, stockVal);
    setSizesList(updated);
  };

  const handleAddSizeRow = () => {
    setSizesList([...sizesList, { size: '', stock: 0 }]);
  };

  const handleRemoveSizeRow = (idx: number) => {
    setSizesList(sizesList.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Mandatory Media Rule Validation: 
    // Requires at least 1 image AND 1 video url before publishing.
    const imagesArray = [imageUrl1, imageUrl2].filter(url => url.trim() !== '');
    
    if (status === 'published') {
      if (imagesArray.length === 0) {
        setValidationError('Mandatory Media Rule: You must provide at least one image URL before publishing.');
        return;
      }
      if (!videoUrl.trim()) {
        setValidationError('Mandatory Media Rule: You must provide a demonstration video URL before publishing.');
        return;
      }
    }

    const formattedColors = colors.split(',').map(c => c.trim()).filter(c => c !== '');
    const cleanSizes = sizesList.filter(s => s.size.trim() !== '');

    // 2. Auto SKU Generation
    // Formula: ETK-{CATEGORY}-{SUBCATEGORY_UPPER_CLEAN}-{NUMBER}
    const subClean = subcategory.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 8);
    const skuIndex = products.filter(p => p.category === category).length + 1;
    const formattedSku = editingProduct 
      ? editingProduct.sku 
      : `ETK-${category.toUpperCase()}-${subClean}-${String(skuIndex).padStart(3, '0')}`;

    const productPayload = {
      name,
      description,
      sku: formattedSku,
      category,
      subcategory,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      sizes: cleanSizes,
      colors: formattedColors,
      fabric,
      customizationAvailable,
      images: imagesArray,
      video: videoUrl,
      tags: [category, subcategory, fabric],
      status: status
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
    } else {
      addProduct(productPayload);
    }

    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Section */}
      <div className="flex justify-between items-center border-b border-cream-200 pb-4">
        <div>
          <h3 className="font-serif text-xl text-charcoal-900">Manage Boutique Products</h3>
          <p className="text-xs text-charcoal-500 font-sans mt-0.5">Add new designs, generate boutique SKUs, and manage sizes.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-luxury-solid flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Mandatory Media Notice */}
      <div className="bg-teal-50 border border-teal-200 p-4 text-xs font-sans text-teal-900 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-teal-800 mt-0.5 shrink-0" />
        <div>
          <span className="font-bold block uppercase tracking-wider text-[10px] mb-1">Mandatory Media Rule</span>
          Every published product must contain at least one catalog image and one motion-reels video before it can be set live. Drafts do not trigger this check. SKUs will be auto-generated upon creation.
        </div>
      </div>

      {/* Products Table list */}
      <div className="overflow-x-auto border border-cream-200">
        <table className="w-full text-left font-sans text-xs">
          <thead className="bg-cream-100 border-b border-cream-200 text-[10px] uppercase tracking-widest text-charcoal-500">
            <tr>
              <th className="p-4">Visual</th>
              <th className="p-4">SKU / Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Fabric</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock (Total)</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200 text-charcoal-800">
            {products.map(p => {
              const totalStock = p.sizes.reduce((sum, sz) => sum + sz.stock, 0);
              return (
                <tr key={p.id} className="hover:bg-cream-50/50">
                  <td className="p-4">
                    <img
                      src={p.images[0]}
                      alt=""
                      className="w-10 h-12 object-cover border border-cream-200 bg-white"
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-[10px] text-teal-800 font-semibold">{p.sku}</div>
                    <div className="font-serif font-medium text-charcoal-900 text-sm">{p.name}</div>
                  </td>
                  <td className="p-4">{p.category} · {p.subcategory}</td>
                  <td className="p-4">{p.fabric}</td>
                  <td className="p-4 font-serif">₹{p.price.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className={totalStock <= 3 ? 'text-terracotta-700 font-semibold' : 'text-charcoal-600'}>
                      {totalStock} pcs
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 uppercase text-[9px] tracking-widest font-medium ${
                      p.status === 'published' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-charcoal-100 text-charcoal-500'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1 text-charcoal-500 hover:text-teal-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${p.name}?`)) deleteProduct(p.id);
                      }}
                      className="p-1 text-charcoal-400 hover:text-rosefabric-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Form Overlay Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-cream-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-cream-200 shadow-2xl p-6 flex flex-col custom-scrollbar">
            
            <div className="flex justify-between items-center border-b border-cream-200 pb-3 mb-4 shrink-0">
              <h4 className="font-serif text-lg text-charcoal-900 uppercase">
                {editingProduct ? `Edit ${editingProduct.sku}` : 'Add New Designer Garment'}
              </h4>
              <button onClick={() => setShowForm(false)} className="p-1 hover:text-teal-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {validationError && (
              <div className="bg-rosefabric-50 border border-rosefabric-200 p-3.5 text-xs font-sans text-rosefabric-800 mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
              
              {/* Name & Desc */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-charcoal-500 font-medium">Garment Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Indigo Silk Pre-Draped Saree"
                  className="w-full px-3 py-2 border border-cream-200 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-charcoal-500 font-medium">Garment Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detail fabric highlights, zardozi craft, or inclusive fit options..."
                  className="w-full px-3 py-2 border border-cream-200 bg-white resize-none"
                />
              </div>

              {/* Category Subcategory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-charcoal-500 font-medium">Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-cream-200 bg-white"
                  >
                    <option value="WOMEN">WOMEN</option>
                    <option value="MEN">MEN</option>
                    <option value="KIDS">KIDS</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-charcoal-500 font-medium">Subcategory *</label>
                  <input
                    type="text"
                    required
                    value={subcategory}
                    onChange={e => setSubcategory(e.target.value)}
                    placeholder="e.g. Pre-Draped Sarees or Kurtas"
                    className="w-full px-3 py-2 border border-cream-200 bg-white"
                  />
                </div>
              </div>

              {/* Pricing, Fabric, Colors */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] uppercase text-charcoal-500 font-medium">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-cream-200 bg-white"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] uppercase text-charcoal-500 font-medium">Original Price</label>
                  <input
                    type="number"
                    value={compareAtPrice}
                    onChange={e => setCompareAtPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-cream-200 bg-white"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] uppercase text-charcoal-500 font-medium">Fabric Type *</label>
                  <input
                    type="text"
                    required
                    value={fabric}
                    onChange={e => setFabric(e.target.value)}
                    placeholder="e.g. Chanderi Silk"
                    className="w-full px-3 py-2 border border-cream-200 bg-white"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] uppercase text-charcoal-500 font-medium">Colors (comma sep)</label>
                  <input
                    type="text"
                    value={colors}
                    onChange={e => setColors(e.target.value)}
                    placeholder="Indigo Blue, Gold"
                    className="w-full px-3 py-2 border border-cream-200 bg-white"
                  />
                </div>
              </div>

              {/* Sizes and stock configuration */}
              <div className="space-y-2 border border-cream-200 p-3 bg-white">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-teal-800 font-semibold mb-2">
                  <span>Sizes & Stock Matrix</span>
                  <button
                    type="button"
                    onClick={handleAddSizeRow}
                    className="px-2 py-0.5 bg-cream-100 hover:bg-teal-800 hover:text-cream-50 transition-colors uppercase text-[9px]"
                  >
                    + Add Size Row
                  </button>
                </div>
                <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar">
                  {sizesList.map((sz, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <input
                        type="text"
                        required
                        value={sz.size}
                        onChange={e => {
                          const updated = [...sizesList];
                          updated[idx].size = e.target.value.toUpperCase();
                          setSizesList(updated);
                        }}
                        placeholder="Size Name (e.g. XL)"
                        className="flex-1 px-3 py-1.5 border border-cream-200"
                      />
                      <input
                        type="number"
                        required
                        value={sz.stock}
                        onChange={e => handleSizeStockChange(idx, Number(e.target.value))}
                        placeholder="Stock qty"
                        className="w-24 px-3 py-1.5 border border-cream-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSizeRow(idx)}
                        className="text-rosefabric-800 p-1 hover:bg-rose-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Media Inputs (Images + Videos) */}
              <div className="space-y-2 border border-cream-200 p-3 bg-white">
                <div className="text-[10px] uppercase tracking-widest text-teal-800 font-semibold mb-2 flex items-center gap-1">
                  <Image className="w-3.5 h-3.5" />
                  <span>Media Upload Links</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-charcoal-400">Primary Catalog Image URL *</label>
                    <input
                      type="url"
                      value={imageUrl1}
                      onChange={e => setImageUrl1(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3 py-2 border border-cream-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-charcoal-400">Alternative Image URL</label>
                    <input
                      type="url"
                      value={imageUrl2}
                      onChange={e => setImageUrl2(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3 py-2 border border-cream-200"
                    />
                  </div>
                </div>
                <div className="space-y-1 pt-1">
                  <label className="text-[9px] uppercase text-charcoal-400 flex items-center gap-1">
                    <Video className="w-3 h-3 text-teal-800" />
                    <span>Garment Video Reel URL (Mandatory for live publishing) *</span>
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://assets.mixkit.co/videos/..."
                    className="w-full px-3 py-2 border border-cream-200"
                  />
                </div>
              </div>

              {/* Custom tailoring & Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="custom-tailor-check"
                    checked={customizationAvailable}
                    onChange={e => setCustomizationAvailable(e.target.checked)}
                    className="w-4 h-4 text-teal-800 border-cream-300"
                  />
                  <label htmlFor="custom-tailor-check" className="text-[10px] uppercase text-charcoal-600 font-medium">Customizable fits</label>
                </div>
                
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] uppercase text-charcoal-500 font-medium block">Publish Status</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="status-radio"
                        checked={status === 'published'}
                        onChange={() => setStatus('published')}
                      />
                      <span>Publish (Media check active)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="status-radio"
                        checked={status === 'draft'}
                        onChange={() => setStatus('draft')}
                      />
                      <span>Save as Draft</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-cream-200 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-charcoal-900 uppercase text-[10px] tracking-widest font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-charcoal-900 text-cream-50 uppercase text-[10px] tracking-widest font-sans font-medium hover:bg-teal-800 transition-colors"
                >
                  Save Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
