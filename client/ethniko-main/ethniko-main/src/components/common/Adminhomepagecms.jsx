import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, RefreshCw, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import { homepageService } from '../services/homepageService';
import AdminHomepageCMS from '../components/common/AdminHomepageCMS';

const EMPTY_SLIDE = {
  title: '',
  subtitle: '',
  image: '',
  ctaLabel: 'Discover the Edit',
  ctaLink: '/shop',
};

export default function AdminHomepageCMS() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null); // slide id currently mid-request (toggle/delete/reorder)

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlide, setNewSlide] = useState(EMPTY_SLIDE);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingDraft, setEditingDraft] = useState(EMPTY_SLIDE);
  const [savingEdit, setSavingEdit] = useState(false);

  const loadSlides = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await homepageService.getHeroSlides();
      setSlides(data);
    } catch (err) {
      setError(err?.message || 'Could not load hero slider banners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const handleCreateSlide = async (e) => {
    e.preventDefault();
    if (!newSlide.title || !newSlide.image) return;
    setCreating(true);
    setError(null);
    try {
      await homepageService.createHeroSlide(newSlide);
      setNewSlide(EMPTY_SLIDE);
      setShowAddForm(false);
      loadSlides();
    } catch (err) {
      setError(err?.message || 'Could not save the new banner.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (slide) => {
    setSavingId(slide.id);
    setError(null);
    try {
      await homepageService.toggleHeroSlideActive(slide.id, !slide.active);
      loadSlides();
    } catch (err) {
      setError(err?.message || 'Could not update banner status.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (slide) => {
    if (!window.confirm(`Remove "${slide.title}" from the homepage slider?`)) return;
    setSavingId(slide.id);
    setError(null);
    try {
      await homepageService.deleteHeroSlide(slide.id);
      loadSlides();
    } catch (err) {
      setError(err?.message || 'Could not delete this banner.');
    } finally {
      setSavingId(null);
    }
  };

  const startEditing = (slide) => {
    setEditingId(slide.id);
    setEditingDraft({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      image: slide.image || '',
      ctaLabel: slide.ctaLabel || 'Discover the Edit',
      ctaLink: slide.ctaLink || '/shop',
    });
  };

  const handleSaveEdit = async (id) => {
    setSavingEdit(true);
    setError(null);
    try {
      await homepageService.updateHeroSlide(id, editingDraft);
      setEditingId(null);
      loadSlides();
    } catch (err) {
      setError(err?.message || 'Could not save changes to this banner.');
    } finally {
      setSavingEdit(false);
    }
  };

  const moveSlide = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const reordered = [...slides];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setSlides(reordered); // optimistic
    setSavingId(reordered[index].id);
    setError(null);
    try {
      const persisted = await homepageService.reorderHeroSlides(reordered.map((s) => s.id));
      setSlides(persisted);
    } catch (err) {
      setError(err?.message || 'Could not save the new banner order.');
      loadSlides(); // revert to server truth
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="w-8 h-8 text-[#B68D40] animate-spin mx-auto mb-4" />
        <span className="font-serif italic text-neutral-500">Loading Homepage Banners...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b pb-3 gap-4">
        <h3 className="font-serif text-lg tracking-wider uppercase">Homepage Banner CMS</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-[9px] uppercase tracking-widest text-[#B68D40] hover:text-black font-sans font-bold focus:outline-none flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Cancel' : 'Add Banner'}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 border border-[#B42318] bg-[#FBEAE8] text-[#B42318] px-4 py-3 text-[10px] font-sans font-semibold uppercase tracking-wider">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Slide Form */}
      {showAddForm && (
        <form onSubmit={handleCreateSlide} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border border-[#D9C7A3] bg-primary dark:bg-neutral-900">
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Banner Title</label>
            <input
              type="text" required
              value={newSlide.title}
              onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
              className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-black focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Subtitle</label>
            <input
              type="text"
              value={newSlide.subtitle}
              onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
              className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-black focus:outline-none"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Image URL</label>
            <input
              type="url" required
              placeholder="https://..."
              value={newSlide.image}
              onChange={(e) => setNewSlide({ ...newSlide, image: e.target.value })}
              className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-black focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">CTA Label</label>
            <input
              type="text"
              value={newSlide.ctaLabel}
              onChange={(e) => setNewSlide({ ...newSlide, ctaLabel: e.target.value })}
              className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-black focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">CTA Link</label>
            <input
              type="text"
              value={newSlide.ctaLink}
              onChange={(e) => setNewSlide({ ...newSlide, ctaLink: e.target.value })}
              className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-xs font-sans text-black focus:outline-none"
            />
          </div>
          <div className="md:col-span-2 pt-2">
            <button type="submit" disabled={creating} className="btn-luxury-solid w-full disabled:opacity-50">
              {creating ? 'Saving Banner...' : 'Publish Banner to Homepage'}
            </button>
          </div>
        </form>
      )}

      {/* Slides list */}
      {slides.length === 0 ? (
        <div className="border border-dashed border-neutral-300 p-10 text-center text-xs font-sans text-neutral-400 uppercase tracking-wider">
          No hero banners yet. Add one to populate the homepage slider.
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, idx) => {
            const isEditing = editingId === slide.id;
            const isBusy = savingId === slide.id;

            return (
              <div key={slide.id} className="border bg-neutral-50 dark:bg-neutral-900">
                {!isEditing ? (
                  <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <img
                      src={slide.image}
                      alt=""
                      className="w-28 aspect-[16/9] object-cover border shrink-0"
                    />

                    <div className="flex-grow space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">
                        Slide {idx + 1} of {slides.length}
                      </span>
                      <h4 className="font-serif text-sm text-neutral-800 dark:text-primary">{slide.title}</h4>
                      {slide.subtitle && (
                        <p className="text-[11px] font-sans text-neutral-500">{slide.subtitle}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col border">
                        <button
                          onClick={() => moveSlide(idx, -1)}
                          disabled={idx === 0 || isBusy}
                          className="p-1 text-neutral-400 hover:text-[#B68D40] disabled:opacity-30 focus:outline-none"
                          aria-label="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveSlide(idx, 1)}
                          disabled={idx === slides.length - 1 || isBusy}
                          className="p-1 text-neutral-400 hover:text-[#B68D40] disabled:opacity-30 focus:outline-none border-t"
                          aria-label="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => startEditing(slide)}
                        className="p-2 border text-neutral-400 hover:text-[#B68D40] hover:border-[#B68D40] focus:outline-none"
                        aria-label="Edit banner"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleActive(slide)}
                        disabled={isBusy}
                        className={`px-4 py-2 border text-[9px] tracking-widest uppercase font-sans font-bold focus:outline-none transition-colors disabled:opacity-50 ${
                          slide.active
                            ? 'border-[#3E7C59] text-[#3E7C59] hover:bg-[#B42318] hover:border-[#B42318] hover:text-white'
                            : 'border-neutral-300 text-neutral-400 hover:border-[#3E7C59] hover:text-[#3E7C59]'
                        }`}
                      >
                        {isBusy ? '...' : slide.active ? 'Active' : 'Disabled'}
                      </button>

                      <button
                        onClick={() => handleDelete(slide)}
                        disabled={isBusy}
                        className="p-2 text-neutral-400 hover:text-[#B42318] focus:outline-none disabled:opacity-50"
                        aria-label="Delete banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Banner Title</label>
                        <input
                          type="text"
                          value={editingDraft.title}
                          onChange={(e) => setEditingDraft({ ...editingDraft, title: e.target.value })}
                          className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans text-black"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Subtitle</label>
                        <input
                          type="text"
                          value={editingDraft.subtitle}
                          onChange={(e) => setEditingDraft({ ...editingDraft, subtitle: e.target.value })}
                          className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans text-black"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Image URL</label>
                        <input
                          type="url"
                          value={editingDraft.image}
                          onChange={(e) => setEditingDraft({ ...editingDraft, image: e.target.value })}
                          className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans text-black"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">CTA Label</label>
                        <input
                          type="text"
                          value={editingDraft.ctaLabel}
                          onChange={(e) => setEditingDraft({ ...editingDraft, ctaLabel: e.target.value })}
                          className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans text-black"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">CTA Link</label>
                        <input
                          type="text"
                          value={editingDraft.ctaLink}
                          onChange={(e) => setEditingDraft({ ...editingDraft, ctaLink: e.target.value })}
                          className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans text-black"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveEdit(slide.id)}
                        disabled={savingEdit}
                        className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white text-[9px] font-sans font-bold uppercase tracking-widest disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1.5 px-4 py-2 border text-neutral-500 text-[9px] font-sans font-bold uppercase tracking-widest"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}