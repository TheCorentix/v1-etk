import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Settings, Check, Sparkles, AlertCircle } from 'lucide-react';
import { homepageService } from '../../services/homepageService';
import toast from 'react-hot-toast';

export default function HomepageSectionBuilder() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSection, setNewSection] = useState({
    type: 'PRODUCT_GRID',
    order: 1,
    title: '',
    subtitle: '',
    referenceId: '',
    referenceCollection: '',
    settings: { layout: 'grid', bgGradient: 'none' }
  });

  const loadSections = async () => {
    setLoading(true);
    try {
      const data = await homepageService.getSections();
      // Sort by order
      const sorted = data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setSections(sorted);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load homepage builder sections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      const order = sections.length > 0 ? (sections[sections.length - 1].order ?? 0) + 1 : 1;
      
      // Setup payload (Multipart Form payload since server upload.single('image') middleware is mounted on sections routes)
      const formData = new FormData();
      formData.append('type', newSection.type);
      formData.append('order', String(order));
      formData.append('title', newSection.title);
      formData.append('subtitle', newSection.subtitle || '');
      formData.append('referenceId', newSection.referenceId || '');
      formData.append('referenceCollection', newSection.referenceCollection || '');
      formData.append('settings', JSON.stringify(newSection.settings));

      await homepageService.createSection(formData);
      toast.success('Homepage section created successfully!');
      setShowAddSection(false);
      // Reset form
      setNewSection({
        type: 'PRODUCT_GRID',
        order: 1,
        title: '',
        subtitle: '',
        referenceId: '',
        referenceCollection: '',
        settings: { layout: 'grid', bgGradient: 'none' }
      });
      loadSections();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create section.');
    }
  };

  const handleDeleteSection = async (id) => {
    if (window.confirm('Are you sure you want to remove this section from the homepage layout?')) {
      try {
        await homepageService.deleteSection(id);
        toast.success('Section deleted successfully.');
        loadSections();
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete section.');
      }
    }
  };

  const handleMove = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const reordered = [...sections];
    // Swap sections
    const temp = reordered[index];
    reordered[index] = reordered[newIndex];
    reordered[newIndex] = temp;

    // Update local order state locally
    const updated = reordered.map((sec, idx) => ({
      ...sec,
      order: idx + 1
    }));
    setSections(updated);

    try {
      // Save changes to database
      await Promise.all(updated.map(async (sec) => {
        const formData = new FormData();
        formData.append('order', String(sec.order));
        await homepageService.updateSection(sec.id, formData);
      }));
      toast.success('Layout reordered successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to persist order updates.');
      loadSections();
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-neutral-400 italic">Syncing Homepage Grid Sections...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-3">
        <h3 className="font-serif text-lg tracking-wider uppercase flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#B68D40]" />
          <span>Homepage Section Builder</span>
        </h3>
        <button
          onClick={() => setShowAddSection(!showAddSection)}
          className="text-[9px] uppercase tracking-widest text-[#B68D40] hover:text-black font-sans font-bold focus:outline-none flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddSection ? "Cancel" : "Add Section"}</span>
        </button>
      </div>

      {/* Add Section form */}
      {showAddSection && (
        <form onSubmit={handleCreateSection} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border border-[#D9C7A3] bg-primary dark:bg-neutral-900 rounded-lg">
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Section Title</label>
            <input
              type="text" required
              value={newSection.title}
              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
              className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block">Section Type</label>
            <select
              value={newSection.type}
              onChange={(e) => setNewSection({ ...newSection, type: e.target.value })}
              className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2.5 text-xs font-sans focus:outline-none"
            >
              <option value="PRODUCT_GRID">PRODUCT GRID RAIL</option>
              <option value="LOOKBOOK_SNAP">LOOK & SHOP HERO</option>
              <option value="TESTIMONIALS">TESTIMONIALS SLIDER</option>
              <option value="VIDEO_INTRO">VIDEO BANNER INTRO</option>
              <option value="NEWSLETTER">NEWSLETTER JOURNAL</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Section Subtitle (Optional)</label>
            <input
              type="text"
              value={newSection.subtitle}
              onChange={(e) => setNewSection({ ...newSection, subtitle: e.target.value })}
              className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans">Reference Collection / ID (e.g. custom category name)</label>
            <input
              type="text"
              placeholder="e.g. Sarees or Lookbook reference ID"
              value={newSection.referenceId}
              onChange={(e) => setNewSection({ ...newSection, referenceId: e.target.value })}
              className="w-full bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-2 text-xs font-sans focus:outline-none"
            />
          </div>
          <div className="md:col-span-2 pt-2">
            <button type="submit" className="btn-luxury-solid w-full">Deploy Layout Section</button>
          </div>
        </form>
      )}

      {/* Sections Lists Table */}
      <div className="space-y-4">
        {sections.map((sec, idx) => (
          <div
            key={sec.id}
            className="border p-4 flex items-center justify-between gap-6 bg-white dark:bg-neutral-900 border-[#ECECEC] dark:border-neutral-800 shadow-sm rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-[#B68D40]/10 flex items-center justify-center text-[#B68D40] text-[10px] font-sans font-bold">
                {sec.order}
              </span>
              <div className="space-y-0.5 text-left">
                <span className="text-[8px] uppercase tracking-wider font-mono px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded">
                  {sec.type}
                </span>
                <h4 className="font-serif text-sm text-neutral-800 dark:text-primary pt-1">{sec.title}</h4>
                {sec.subtitle && <p className="text-[10px] font-sans text-neutral-400">{sec.subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={idx === 0}
                onClick={() => handleMove(idx, 'up')}
                className="p-2 border hover:border-[#B68D40] hover:text-[#B68D40] disabled:opacity-20 disabled:hover:border-neutral-200 transition-colors rounded focus:outline-none"
                title="Move Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={idx === sections.length - 1}
                onClick={() => handleMove(idx, 'down')}
                className="p-2 border hover:border-[#B68D40] hover:text-[#B68D40] disabled:opacity-20 disabled:hover:border-neutral-200 transition-colors rounded focus:outline-none"
                title="Move Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeleteSection(sec.id)}
                className="p-2 border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors rounded focus:outline-none ml-2"
                title="Delete section"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-12 border border-dashed border-neutral-200 rounded-lg text-neutral-400 italic flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>No sections configured on the homepage grid. Add a section to get started.</span>
          </div>
        )}
      </div>
    </div>
  );
}
