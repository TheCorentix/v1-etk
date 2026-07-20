import React, { useState } from 'react';
import { PackageCheck, ShieldAlert, History, ArrowRight, RefreshCw, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useEtnikoStore } from '../store/useEtnikoStore';
import { Product, ProductSize } from '../types/schema';

export const AdminInventory: React.FC = () => {
  const products = useEtnikoStore(state => state.products);
  const inventoryLogs = useEtnikoStore(state => state.inventoryLogs);
  const adjustStock = useEtnikoStore(state => state.adjustStock);
  const settings = useEtnikoStore(state => state.settings);

  const [activeTab, setActiveTab] = useState<'matrix' | 'logs'>('matrix');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  const lowStockThreshold = settings.lowStockThreshold;

  // Flattened inventory view listing each SKU + size combo
  const flatInventory = React.useMemo(() => {
    const list: { product: Product; sz: ProductSize }[] = [];
    products.forEach(p => {
      p.sizes.forEach(s => {
        list.push({ product: p, sz: s });
      });
    });
    return list;
  }, [products]);

  const handleOpenAdjust = (product: Product, size: string) => {
    setSelectedProduct(product);
    setSelectedSize(size);
    setStockAdjustment(0);
    setAdjustmentReason('');
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedSize || stockAdjustment === 0 || !adjustmentReason.trim()) return;

    adjustStock(
      selectedProduct.id,
      selectedSize,
      stockAdjustment,
      adjustmentReason,
      'admin'
    );

    setShowAdjustModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="border-b border-cream-200 pb-4 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-xl text-charcoal-900">Inventory Logs & Control</h3>
          <p className="text-xs text-charcoal-500 font-sans mt-0.5">Adjust stock levels per size, config alert thresholds, and inspect changes history.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider font-sans border transition-all ${
              activeTab === 'matrix' ? 'border-teal-800 bg-teal-800 text-cream-50' : 'border-cream-200 bg-white text-charcoal-500'
            }`}
          >
            Stock Matrix
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider font-sans border transition-all ${
              activeTab === 'logs' ? 'border-teal-800 bg-teal-800 text-cream-50' : 'border-cream-200 bg-white text-charcoal-500'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* MATRIX VIEW */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          
          {/* Low stock alerts bar */}
          {flatInventory.some(i => i.sz.stock <= lowStockThreshold) && (
            <div className="bg-rosefabric-50 border border-rosefabric-200 p-4 text-xs font-sans text-rosefabric-800 flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-rosefabric-800 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block uppercase tracking-wider text-[10px] mb-1">Low Stock Alert Triggered</span>
                The following designer pieces are running below your alert threshold of {lowStockThreshold} pcs. Replenish size stock levels immediately to avoid sales block.
              </div>
            </div>
          )}

          {/* Inventory Table */}
          <div className="overflow-x-auto border border-cream-200 bg-white">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-cream-100 border-b border-cream-200 text-[10px] uppercase tracking-widest text-charcoal-500">
                <tr>
                  <th className="p-4">SKU / Product</th>
                  <th className="p-4">Size Tag</th>
                  <th className="p-4">Fabric</th>
                  <th className="p-4">Active Stock</th>
                  <th className="p-4">Status Alert</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200 text-charcoal-800">
                {flatInventory.map(({ product, sz }, index) => {
                  const isLow = sz.stock <= lowStockThreshold;
                  return (
                    <tr key={`${product.id}-${sz.size}-${index}`} className="hover:bg-cream-50/50">
                      <td className="p-4">
                        <div className="font-mono text-[10px] text-teal-800 font-semibold">{product.sku}</div>
                        <div className="font-serif font-medium text-charcoal-900 text-sm mt-0.5">{product.name}</div>
                      </td>
                      <td className="p-4 font-mono font-semibold">{sz.size}</td>
                      <td className="p-4">{product.fabric}</td>
                      <td className="p-4 font-semibold text-sm">
                        <span className={isLow ? 'text-rosefabric-800 font-bold' : 'text-charcoal-800'}>
                          {sz.stock} pcs
                        </span>
                      </td>
                      <td className="p-4">
                        {sz.stock === 0 ? (
                          <span className="bg-charcoal-900 text-cream-50 text-[8px] uppercase tracking-widest font-semibold px-2 py-0.5">
                            Out of Stock
                          </span>
                        ) : (
                          isLow ? (
                            <span className="bg-rosefabric-50 text-rosefabric-800 border border-rosefabric-200 text-[8px] uppercase tracking-widest font-semibold px-2 py-0.5 flex items-center gap-1 w-max">
                              <ShieldAlert className="w-3 h-3" />
                              <span>Low Level</span>
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[8px] uppercase tracking-widest font-semibold px-2 py-0.5 w-max block">
                              Satisfactory
                            </span>
                          )
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenAdjust(product, sz.size)}
                          className="px-3 py-1.5 border border-charcoal-900 text-[10px] uppercase tracking-wider font-semibold hover:bg-charcoal-900 hover:text-cream-50 transition-all font-sans"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* AUDIT LOGS VIEW */}
      {activeTab === 'logs' && (
        <div className="overflow-x-auto border border-cream-200 bg-white">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-cream-100 border-b border-cream-200 text-[10px] uppercase tracking-widest text-charcoal-500">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Garment SKU</th>
                <th className="p-4">Size</th>
                <th className="p-4">Previous → New</th>
                <th className="p-4">Delta Shift</th>
                <th className="p-4">Origin Operator</th>
                <th className="p-4">Justification Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200 text-charcoal-800">
              {inventoryLogs.map(log => {
                const delta = log.newStock - log.previousStock;
                return (
                  <tr key={log.id} className="hover:bg-cream-50/50">
                    <td className="p-4 text-charcoal-400">{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                    <td className="p-4 font-mono font-semibold">
                      <div>{log.sku}</div>
                      <div className="text-charcoal-400 font-sans font-normal text-[10px] mt-0.5">{log.productName}</div>
                    </td>
                    <td className="p-4 font-semibold font-mono">{log.size}</td>
                    <td className="p-4 font-mono text-charcoal-600">{log.previousStock} pcs → {log.newStock} pcs</td>
                    <td className="p-4">
                      {delta > 0 ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>+{delta}</span>
                        </span>
                      ) : (
                        <span className="text-rosefabric-800 font-bold flex items-center gap-0.5">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>{delta}</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[9px] uppercase tracking-widest font-semibold font-mono ${
                        log.adjustedBy === 'sale' ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-cream-100 text-charcoal-600'
                      }`}>
                        {log.adjustedBy}
                      </span>
                    </td>
                    <td className="p-4 text-charcoal-600 italic">"{log.reason}"</td>
                  </tr>
                );
              })}
              {inventoryLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-charcoal-400 font-sans">
                    No manual inventory adjustment records logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ADJUSTMENT MODAL FORM */}
      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-cream-50 w-full max-w-md border border-cream-200 shadow-2xl p-6 page-fade-in text-xs font-sans text-charcoal-800">
            
            <div className="flex justify-between items-center border-b border-cream-200 pb-3 mb-4">
              <h4 className="font-serif text-base text-charcoal-900 uppercase">
                Adjust stock: {selectedProduct.sku} ({selectedSize})
              </h4>
              <button onClick={() => setShowAdjustModal(false)} className="p-1 hover:text-teal-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              
              <div className="bg-cream-100 p-3 border border-cream-200">
                <div className="font-serif font-medium">{selectedProduct.name}</div>
                <div className="text-[10px] text-charcoal-500 mt-0.5">Current Stock Level: <span className="font-bold">{selectedProduct.sizes.find(s => s.size === selectedSize)?.stock} pcs</span></div>
              </div>

              {/* Delta change */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-charcoal-500 font-medium">Adjustment Shift (Delta Value)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    required
                    value={stockAdjustment}
                    onChange={e => setStockAdjustment(Number(e.target.value))}
                    placeholder="e.g. +5 or -2"
                    className="w-full px-3 py-2 border border-cream-200 bg-white"
                  />
                </div>
                <p className="text-[9px] text-charcoal-400">Input positive integers to add units, and negative integers to deduct units.</p>
              </div>

              {/* Justification Reason */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-charcoal-500 font-medium">Justification Reason *</label>
                <input
                  type="text"
                  required
                  value={adjustmentReason}
                  onChange={e => setAdjustmentReason(e.target.value)}
                  placeholder="e.g. Received handloom shipment or damaged stock write-off"
                  className="w-full px-3 py-2 border border-cream-200 bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-cream-200 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 border border-charcoal-900 uppercase text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-charcoal-900 text-cream-50 uppercase text-[10px] font-medium hover:bg-teal-800 transition-colors"
                >
                  Save Shift Log
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
