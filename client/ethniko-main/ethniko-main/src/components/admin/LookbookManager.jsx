import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Film, AlertCircle } from 'lucide-react';
import { lookbookService } from '../../services/lookbookService';
import toast from 'react-hot-toast';

// Staggered default hotspot positions assigned to newly linked products, in order.
const DEFAULT_POSITIONS = [
  { x: 25, y: 30 }, { x: 70, y: 25 }, { x: 30, y: 65 }, { x: 75, y: 70 }, { x: 50, y: 50 },
];

export default function LookbookManager({ products = [] }) {
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [linkedProducts, setLinkedProducts] = useState([]); // [{ productId, x, y }]
  const [productSearch, setProductSearch] = useState('');

  const loadLooks = async () => {
    setLoading(true);
    try {
      const data = await lookbookService.getLookbooks(1, 50);
      setLooks(data.items || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load Look & Shop videos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLooks();
  }, []);

  const resetForm = () => {
    setTitle('');
    setVideoFile(null);
    setThumbnailFile(null);
    setLinkedProducts([]);
    setProductSearch('');
  };

  const toggleProduct = (productId) => {
    setLinkedProducts((prev) => {
      const exists = prev.find((t) => t.productId === productId);
      if (exists) return prev.filter((t) => t.productId !== productId);
      const pos = DEFAULT_POSITIONS[prev.length % DEFAULT_POSITIONS.length];
      return [...prev, { productId, x: pos.x, y: pos.y }];
    });
  };

  const updateTagPosition = (productId, axis, value) => {
    const clamped = Math.max(0, Math.min(100, Number(value) || 0));
    setLinkedProducts((prev) => prev.map((t) => (t.productId === productId ? { ...t, [axis]: clamped } : t)));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      toast.error('Please select a video file.');
      return;
    }
    if (linkedProducts.length === 0) {
      toast.error('Link at least one product to this look.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('tags', JSON.stringify(linkedProducts));
      formData.append('video', videoFile);
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

      await lookbookService.createLookbook(formData);
      toast.success('Look published successfully!');
      resetForm();
      setShowAddForm(false);
      loadLooks();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to publish look.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this look? Its video and thumbnail will be deleted permanently.')) return;
    try {
      await lookbookService.deleteLookbook(id);
      toast.success('Look deleted.');
      loadLooks();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete look.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return true;
    return p.name?.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
  });

  if (loading) {
    return <div className="text-center py-10 text-neutral-400 italic">Syncing Look &amp; Shop reels...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-3">
        <h3 className="font-serif text-lg tracking-wider uppercase flex items-center gap-2">
          <Film className="w-5 h-5 text-[#B68D40]" />
          <span>Look &amp; Shop Videos</span>
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-[9px] uppercase tracking-widest text-[#B68D40] hover:text-black font-sans font-bold focus:outline-none flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Cancel' : 'Add Look'}</span>
        </button>
      </div>

      {/* Add Look form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="space-y-5 p-6 border border-[#D9C7A3] bg-primary rounded-lg text-left">
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold block">Look Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Festive Drape Edit"
              className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block font-bold">
                Video File <span className="text-[#B68D40]">*</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="bg-neutral-900 hover:bg-[#B68D40] text-white hover:text-black px-4 py-2 text-[10px] tracking-wider uppercase font-bold transition-colors">
                  Choose Video
                </span>
                <span className="text-[10px] text-neutral-500 font-mono line-clamp-1">{videoFile?.name || 'No file selected'}</span>
                <input
                  type="file"
                  accept="video/*"
                  required
                  className="hidden"
                  onChange={(e) => setVideoFile(e.target.files[0] || null)}
                />
              </label>
              <span className="text-[9px] text-neutral-400 font-sans block">Max 50MB.</span>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block font-bold">Thumbnail (Optional)</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="bg-neutral-900 hover:bg-[#B68D40] text-white hover:text-black px-4 py-2 text-[10px] tracking-wider uppercase font-bold transition-colors">
                  Choose Image
                </span>
                <span className="text-[10px] text-neutral-500 font-mono line-clamp-1">{thumbnailFile?.name || 'Auto from video frame'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setThumbnailFile(e.target.files[0] || null)}
                />
              </label>
            </div>
          </div>

          {/* Product linking */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans font-bold">
                Link Products <span className="text-[#B68D40]">*</span> ({linkedProducts.length} selected)
              </label>
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="bg-white border border-neutral-300 px-2 py-1 text-[10px] font-sans focus:outline-none w-48"
              />
            </div>
            <div className="max-h-56 overflow-y-auto border border-neutral-200 bg-white divide-y divide-neutral-100">
              {filteredProducts.map((p) => {
                const tag = linkedProducts.find((t) => t.productId === p.id);
                const selected = !!tag;
                return (
                  <div key={p.id} className={`flex items-center gap-3 p-2.5 text-left ${selected ? 'bg-[#B68D40]/5' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleProduct(p.id)}
                      className="accent-[#B68D40] w-3.5 h-3.5 shrink-0"
                    />
                    <img src={p.images?.[0]} alt="" className="w-8 h-8 object-cover shrink-0 border border-neutral-200" />
                    <div className="flex-grow min-w-0">
                      <span className="text-xs font-sans font-semibold text-neutral-800 block truncate">{p.name}</span>
                      <span className="text-[9px] text-neutral-400 font-mono block">{p.sku}</span>
                    </div>
                    {selected && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <label className="text-[8px] text-neutral-400 uppercase">X%</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={tag.x}
                          onChange={(e) => updateTagPosition(p.id, 'x', e.target.value)}
                          className="w-12 border border-neutral-300 px-1 py-1 text-[10px] font-sans"
                        />
                        <label className="text-[8px] text-neutral-400 uppercase">Y%</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={tag.y}
                          onChange={(e) => updateTagPosition(p.id, 'y', e.target.value)}
                          className="w-12 border border-neutral-300 px-1 py-1 text-[10px] font-sans"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="p-4 text-center text-[10px] text-neutral-400 italic">No products match your search.</div>
              )}
            </div>
            <p className="text-[9px] text-neutral-400 font-sans">X/Y set where each product's tag pin appears over the video (0-100%).</p>
          </div>

          <button type="submit" disabled={submitting} className="btn-luxury-solid w-full font-bold">
            {submitting ? 'Publishing...' : 'Publish Look'}
          </button>
        </form>
      )}

      {/* Looks list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {looks.map((look) => (
          <div key={look.id} className="border border-[#ECECEC] bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="aspect-[3/4] bg-neutral-100 relative">
              {look.thumbnailUrl ? (
                <img src={look.thumbnailUrl} alt={look.title} className="w-full h-full object-cover" />
              ) : (
                <video src={look.videoUrl} className="w-full h-full object-cover" muted />
              )}
              <span className="absolute top-2 left-2 bg-black/70 text-white text-[8px] font-sans font-bold px-2 py-1 uppercase tracking-wider">
                {look.tags?.length || 0} Product{look.tags?.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="p-3 space-y-2">
              <h4 className="font-serif text-sm text-neutral-800 line-clamp-1">{look.title}</h4>
              <div className="flex flex-wrap gap-1">
                {(look.tags || []).map((t) => {
                  const p = products.find((pr) => pr.id === t.productId);
                  return (
                    <span key={t.productId} className="text-[8px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
                      {p ? p.name : t.productId}
                    </span>
                  );
                })}
              </div>
              <div className="flex justify-end pt-1">
                <button onClick={() => handleDelete(look.id)} className="p-1.5 text-red-500 hover:text-red-700" aria-label="Delete look">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {looks.length === 0 && (
        <div className="text-center py-12 border border-dashed border-neutral-200 rounded-lg text-neutral-400 italic flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>No Look &amp; Shop videos published yet. Add one to get started.</span>
        </div>
      )}
    </div>
  );
}
