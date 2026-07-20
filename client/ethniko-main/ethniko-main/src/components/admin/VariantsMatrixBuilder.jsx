import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import MediaLibraryDialog from './MediaLibraryDialog';
import toast from 'react-hot-toast';

export default function VariantsMatrixBuilder({ baseSku, basePrice, onChange, initialVariants = [] }) {
  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState('');
  
  const [sizes, setSizes] = useState(['S', 'M', 'L']);
  const [sizeInput, setSizeInput] = useState('');

  const [fabrics, setFabrics] = useState([]);
  const [fabricInput, setFabricInput] = useState('');

  const [matrix, setMatrix] = useState([]);

  // Media Selector States for Matrix row
  const [mediaOpen, setMediaOpen] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState(null);

  // Sync initialVariants if editing an existing garment
  useEffect(() => {
    if (initialVariants && initialVariants.length > 0 && matrix.length === 0) {
      setMatrix(initialVariants.map((v, idx) => ({
        id: v.id || `var-${idx}`,
        color: v.color || '',
        size: v.size || '',
        fabric: v.fabric || '',
        sku: v.sku || `${baseSku || 'ETK'}-${v.color || 'COL'}-${v.size || 'SZ'}`,
        price: v.price || basePrice || 10000,
        stock: v.stock || 10,
        images: v.images || []
      })));

      // Populate unique inputs
      const uniqueColors = Array.from(new Set(initialVariants.map(v => v.color).filter(Boolean)));
      if (uniqueColors.length > 0) setColors(uniqueColors);

      const uniqueSizes = Array.from(new Set(initialVariants.map(v => v.size).filter(Boolean)));
      if (uniqueSizes.length > 0) setSizes(uniqueSizes);

      const uniqueFabrics = Array.from(new Set(initialVariants.map(v => v.fabric).filter(Boolean)));
      if (uniqueFabrics.length > 0) setFabrics(uniqueFabrics);
    }
  }, [initialVariants]);

  // Bubble up matrix updates
  useEffect(() => {
    onChange(matrix);
  }, [matrix]);

  const handleAddColor = () => {
    const trimmed = colorInput.trim();
    if (trimmed && !colors.includes(trimmed)) {
      setColors([...colors, trimmed]);
      setColorInput('');
    }
  };

  const handleAddSize = () => {
    const trimmed = sizeInput.trim().toUpperCase();
    if (trimmed && !sizes.includes(trimmed)) {
      setSizes([...sizes, trimmed]);
      setSizeInput('');
    }
  };

  const handleAddFabric = () => {
    const trimmed = fabricInput.trim();
    if (trimmed && !fabrics.includes(trimmed)) {
      setFabrics([...fabrics, trimmed]);
      setFabricInput('');
    }
  };

  const generateMatrix = () => {
    if (colors.length === 0 && sizes.length === 0 && fabrics.length === 0) {
      toast.error('Add at least one color, size, or fabric weave option.');
      return;
    }

    // Cartesian product helper
    const getCartesian = (arrays) => {
      return arrays.reduce((acc, curr) => {
        return acc.flatMap(d => curr.map(e => [...d, e]));
      }, [[]]);
    };

    const activeColors = colors.length > 0 ? colors : [''];
    const activeSizes = sizes.length > 0 ? sizes : [''];
    const activeFabrics = fabrics.length > 0 ? fabrics : [''];

    const combinations = getCartesian([activeColors, activeSizes, activeFabrics]);

    const generated = combinations.map((combo, idx) => {
      const [col, sz, fab] = combo;
      const colPart = col ? col.substring(0, 3).toUpperCase() : 'ALL';
      const szPart = sz ? sz : 'M';
      const skuSuffix = `${colPart}-${szPart}`;
      
      return {
        id: `gen-var-${idx}-${Date.now()}`,
        color: col,
        size: sz,
        fabric: fab,
        sku: `${baseSku || 'ETK'}-${skuSuffix}`,
        price: basePrice || 10000,
        stock: 10,
        images: []
      };
    });

    setMatrix(generated);
    toast.success(`Generated ${generated.length} variant rows.`);
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...matrix];
    updated[index][field] = value;
    setMatrix(updated);
  };

  const handleRemoveRow = (index) => {
    setMatrix(matrix.filter((_, idx) => idx !== index));
  };

  const triggerMediaSelect = (index) => {
    setActiveRowIndex(index);
    setMediaOpen(true);
  };

  const handleMediaSelected = (url) => {
    if (activeRowIndex !== null) {
      const updated = [...matrix];
      const currentImages = updated[activeRowIndex].images || [];
      if (!currentImages.includes(url)) {
        updated[activeRowIndex].images = [...currentImages, url];
        setMatrix(updated);
      }
    }
    setMediaOpen(false);
    setActiveRowIndex(null);
  };

  return (
    <div className="space-y-6 border border-[#E6DCCF] dark:border-neutral-800 p-6 bg-primary dark:bg-neutral-900 rounded-lg">
      
      <div className="flex items-center justify-between border-b pb-2.5">
        <h4 className="text-[10px] tracking-widest text-[#B68D40] font-sans font-bold uppercase flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Product Variants Matrix</span>
        </h4>
        <button
          type="button"
          onClick={generateMatrix}
          className="text-[9px] uppercase tracking-widest bg-white dark:bg-neutral-800 border border-[#B68D40] text-[#B68D40] hover:bg-[#B68D40] hover:text-white px-3 py-1.5 font-sans font-bold transition-colors focus:outline-none flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Generate Combinations</span>
        </button>
      </div>

      {/* Option Builders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Colors builder */}
        <div className="space-y-2.5">
          <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block font-semibold">Available Colors</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Royal Blue"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              className="flex-grow bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-1.5 text-xs font-sans focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddColor}
              className="bg-neutral-900 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:outline-none"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {colors.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border text-[8px] font-mono tracking-wide uppercase rounded shadow-sm">
                <span>{c}</span>
                <button type="button" onClick={() => setColors(colors.filter(i => i !== c))} className="text-red-500 hover:text-red-700">×</button>
              </span>
            ))}
            {colors.length === 0 && <p className="text-[9px] text-neutral-400 italic">No color limits set.</p>}
          </div>
        </div>

        {/* Sizes builder */}
        <div className="space-y-2.5">
          <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block font-semibold">Available Sizes</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. XXL"
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              className="flex-grow bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-1.5 text-xs font-sans focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSize}
              className="bg-neutral-900 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:outline-none"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border text-[8px] font-mono tracking-wide uppercase rounded shadow-sm">
                <span>{s}</span>
                <button type="button" onClick={() => setSizes(sizes.filter(i => i !== s))} className="text-red-500 hover:text-red-700">×</button>
              </span>
            ))}
            {sizes.length === 0 && <p className="text-[9px] text-neutral-400 italic">No sizing limits set.</p>}
          </div>
        </div>

        {/* Fabric weave options */}
        <div className="space-y-2.5">
          <label className="text-[9px] uppercase tracking-wider text-neutral-400 font-sans block font-semibold">Available Weave / Fabrics</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Chanderi Silk"
              value={fabricInput}
              onChange={(e) => setFabricInput(e.target.value)}
              className="flex-grow bg-white dark:bg-neutral-850 border border-neutral-300 px-3 py-1.5 text-xs font-sans focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddFabric}
              className="bg-neutral-900 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:outline-none"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {fabrics.map((f) => (
              <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border text-[8px] font-mono tracking-wide uppercase rounded shadow-sm">
                <span>{f}</span>
                <button type="button" onClick={() => setFabrics(fabrics.filter(i => i !== f))} className="text-red-500 hover:text-red-700">×</button>
              </span>
            ))}
            {fabrics.length === 0 && <p className="text-[9px] text-neutral-400 italic">No custom fabric weave filters set.</p>}
          </div>
        </div>

      </div>

      {/* Generated Matrix Table */}
      {matrix.length > 0 && (
        <div className="overflow-x-auto pt-4 border-t">
          <table className="w-full border-collapse border text-[9px] uppercase text-left">
            <thead>
              <tr className="bg-neutral-50 border-b font-semibold text-neutral-500 tracking-wider">
                <th className="p-2">SPECIFICATIONS</th>
                <th className="p-2">SKU CODE</th>
                <th className="p-2">PRICE (INR)</th>
                <th className="p-2">STOCK LIMIT</th>
                <th className="p-2">IMAGES</th>
                <th className="p-2 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, idx) => (
                <tr key={row.id} className="border-b text-neutral-600 bg-white">
                  <td className="p-2 font-semibold">
                    {row.color && <span className="block text-neutral-800">Color: {row.color}</span>}
                    {row.size && <span className="block text-neutral-800">Size: {row.size}</span>}
                    {row.fabric && <span className="block text-neutral-800">Fabric: {row.fabric}</span>}
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.sku}
                      onChange={(e) => handleRowChange(idx, 'sku', e.target.value)}
                      className="w-full border px-2 py-1 text-[9px] font-mono uppercase"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={row.price}
                      onChange={(e) => handleRowChange(idx, 'price', parseFloat(e.target.value))}
                      className="w-16 border px-2 py-1 text-[9px]"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={row.stock}
                      onChange={(e) => handleRowChange(idx, 'stock', parseInt(e.target.value, 10))}
                      className="w-12 border px-2 py-1 text-[9px]"
                    />
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1.5">
                      {row.images && row.images.map((img, i) => (
                        <div key={i} className="relative w-6 h-8 border group">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...matrix];
                              updated[idx].images = updated[idx].images.filter(url => url !== img);
                              setMatrix(updated);
                            }}
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center text-[7px]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => triggerMediaSelect(idx)}
                        className="w-6 h-8 border border-dashed flex items-center justify-center text-neutral-400 hover:text-[#B68D40] hover:border-[#B68D40]"
                        title="Add image"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="p-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Media Library Selector Dialog */}
      <MediaLibraryDialog
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={handleMediaSelected}
        activeFolder="products"
      />

    </div>
  );
}
