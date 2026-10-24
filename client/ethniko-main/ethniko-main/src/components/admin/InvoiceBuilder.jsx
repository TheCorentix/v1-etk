import React, { useState } from 'react';
import { Download, FileText, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { computeInvoice, formatMoney, paiseToRupeesText, rupeesToPaise } from '../../utils/money';
import { downloadInvoice } from '../../utils/downloadInvoice';

const todayLocal = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in the user's timezone

const blankItem = () => ({ name: '', quantity: '1', unitPrice: '' });

// Form state from a saved invoice (paise -> rupees text), or a fresh form
const toForm = (invoice) =>
  invoice
    ? {
        date: invoice.date,
        items: invoice.items.map((item) => ({
          name: item.name,
          quantity: String(item.quantity),
          unitPrice: paiseToRupeesText(item.unitPrice),
        })),
        discount: invoice.discount ? paiseToRupeesText(invoice.discount) : '',
        shipping: invoice.shipping ? paiseToRupeesText(invoice.shipping) : '',
      }
    : { date: todayLocal(), items: [blankItem()], discount: '', shipping: '' };

const inputClass = 'w-full bg-white border border-neutral-300 px-2.5 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#B68D40]';

/**
 * Admin tool inside a customisation request: list what the customer is being charged for,
 * add a discount and shipping, and the totals work themselves out. Saving gives the invoice
 * its number; the PDF downloads straight after, and can be downloaded again later.
 */
export default function InvoiceBuilder({ request, onUpdated, blockedReason = '' }) {
  const saved = request.invoice || null;
  const [form, setForm] = useState(() => toForm(saved));
  const [working, setWorking] = useState(false);
  const [problems, setProblems] = useState([]);

  const totals = computeInvoice(form.items, form.discount, form.shipping);

  // Has the form changed from what is saved? (A brand-new invoice always counts as unsaved.)
  const savedSignature = JSON.stringify(toForm(saved));
  const dirty = !saved || JSON.stringify(form) !== savedSignature;

  const customer = {
    name: request.customerName,
    phone: request.phone,
    email: request.email,
    address: request.address,
    reference: request.id,
  };

  const setItem = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
    setProblems([]);
  };
  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, blankItem()] }));
  const removeItem = (index) =>
    setForm((prev) => ({ ...prev, items: prev.items.length > 1 ? prev.items.filter((_, i) => i !== index) : prev.items }));
  const setField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setProblems([]);
  };

  const validate = () => {
    const found = [];
    form.items.forEach((item, index) => {
      const row = `Item ${index + 1}`;
      if (!item.name.trim()) found.push(`${row}: enter the product name.`);
      if (!/^\d+$/.test(item.quantity.trim()) || Number(item.quantity) < 1) found.push(`${row}: nos must be a whole number, 1 or more.`);
      if (item.unitPrice.trim() === '' || Number.isNaN(rupeesToPaise(item.unitPrice))) found.push(`${row}: enter the cost as an amount, like 1250 or 1250.50.`);
    });
    if (Number.isNaN(rupeesToPaise(form.discount))) found.push('Discount must be an amount, like 500 or 500.50.');
    if (Number.isNaN(rupeesToPaise(form.shipping))) found.push('Shipping must be an amount, like 100 or 100.50.');
    if (found.length === 0 && totals.discount > totals.subtotal) found.push("The discount can't be more than the subtotal.");
    if (!form.date) found.push('Choose the invoice date.');
    return found;
  };

  const download = async (invoice) => {
    try {
      await downloadInvoice(invoice, customer);
    } catch (err) {
      console.error(err);
      toast.error('The invoice was saved, but the PDF could not be created. Try the download button again.');
    }
  };

  // Save (when there is something new) and then download
  const handleGenerate = async () => {
    if (!dirty && saved) {
      setWorking(true);
      await download(saved);
      setWorking(false);
      return;
    }

    const found = validate();
    setProblems(found);
    if (found.length > 0) {
      toast.error('Please fix the invoice details first.');
      return;
    }

    setWorking(true);
    try {
      const updated = await adminService.saveCustomizationInvoice(request.id, {
        date: form.date,
        items: form.items.map((item) => ({
          name: item.name.trim(),
          quantity: Number(item.quantity),
          unitPrice: rupeesToPaise(item.unitPrice),
        })),
        discount: totals.discount,
        shipping: totals.shipping,
      });
      onUpdated(updated);
      setForm(toForm(updated.invoice));
      toast.success(saved ? 'Invoice updated.' : `Invoice ${updated.invoice.number} created.`);
      await download(updated.invoice);
    } catch (err) {
      console.error(err);
      toast.error(err?.errors?.[0]?.message || err?.message || 'Could not save the invoice.');
    } finally {
      setWorking(false);
    }
  };

  const generateLabel = !saved ? 'Generate invoice & download' : dirty ? 'Save changes & download' : 'Download PDF';

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-1.5">
        <h4 className="flex items-center gap-1.5 text-[10px] tracking-widest text-[#B68D40] font-semibold uppercase">
          <FileText className="w-3.5 h-3.5" />
          Invoice
        </h4>
        {saved ? (
          <span className="text-[10px] text-neutral-500">
            <span className="font-mono font-semibold text-[#B68D40]">{saved.number}</span>
            {' · '}created {new Date(saved.createdAt).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-[10px] text-neutral-400">No invoice yet for this request</span>
        )}
      </div>

      <p className="text-[10px] text-neutral-400 leading-relaxed">
        Billed to <span className="font-semibold text-neutral-600">{request.customerName}</span>. Add what the customer is paying for;
        the totals update as you type.
      </p>

      {/* Items */}
      <div className="overflow-x-auto">
        <div className="min-w-[520px] space-y-2">
          <div className="grid grid-cols-[1fr_64px_104px_104px_24px] gap-2 text-[9px] uppercase tracking-wider text-neutral-400 px-0.5">
            <span>Product name</span>
            <span>Nos</span>
            <span>Cost (₹)</span>
            <span className="text-right">Amount</span>
            <span />
          </div>

          {form.items.map((item, index) => (
            <div key={index} className="grid grid-cols-[1fr_64px_104px_104px_24px] gap-2 items-center">
              <input
                type="text"
                value={item.name}
                onChange={(e) => setItem(index, 'name', e.target.value)}
                placeholder="e.g. Emerald raw silk anarkali"
                className={inputClass}
                aria-label={`Item ${index + 1} product name`}
              />
              <input
                type="text"
                inputMode="numeric"
                value={item.quantity}
                onChange={(e) => setItem(index, 'quantity', e.target.value)}
                className={inputClass}
                aria-label={`Item ${index + 1} nos`}
              />
              <input
                type="text"
                inputMode="decimal"
                value={item.unitPrice}
                onChange={(e) => setItem(index, 'unitPrice', e.target.value)}
                placeholder="0.00"
                className={inputClass}
                aria-label={`Item ${index + 1} cost`}
              />
              <span className="text-right text-xs font-semibold text-neutral-800 tabular-nums">
                {formatMoney(totals.lines[index].amount)}
              </span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={form.items.length === 1}
                className="text-neutral-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-neutral-400"
                aria-label={`Remove item ${index + 1}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-[#B68D40] hover:text-black"
      >
        <Plus className="w-3.5 h-3.5" /> Add item
      </button>

      {/* Date + totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
        <div className="space-y-1 sm:max-w-[180px]">
          <label className="text-[9px] uppercase tracking-wider text-neutral-400 block">Invoice date</label>
          <input type="date" value={form.date} onChange={setField('date')} className={inputClass} />
        </div>

        <div className="space-y-2 bg-[#FBF6EC] border border-[#E6DCCF] p-4">
          <div className="flex justify-between text-xs text-neutral-600">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatMoney(totals.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs text-neutral-600">
            <label htmlFor="invoice-discount">Discount (₹)</label>
            <input
              id="invoice-discount"
              type="text"
              inputMode="decimal"
              value={form.discount}
              onChange={setField('discount')}
              placeholder="0.00"
              className={`${inputClass} !w-28 text-right`}
            />
          </div>
          <div className="flex items-center justify-between gap-3 text-xs text-neutral-600">
            <label htmlFor="invoice-shipping">Shipping (₹)</label>
            <input
              id="invoice-shipping"
              type="text"
              inputMode="decimal"
              value={form.shipping}
              onChange={setField('shipping')}
              placeholder="0.00"
              className={`${inputClass} !w-28 text-right`}
            />
          </div>
          <div className="flex justify-between items-baseline border-t border-[#B68D40]/40 pt-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-800">Total</span>
            <span className="text-base font-bold text-neutral-900 tabular-nums">{formatMoney(totals.total)}</span>
          </div>
        </div>
      </div>

      {problems.length > 0 && (
        <ul className="list-disc list-inside space-y-0.5 bg-red-50 border border-red-300 px-4 py-3 text-[10px] text-red-600">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}

      {blockedReason && <p className="text-[10px] text-[#B68D40]">{blockedReason}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={working || (dirty && Boolean(blockedReason))}
          className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#B68D40] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-3.5 h-3.5" />
          {working ? 'Working…' : generateLabel}
        </button>
        {saved && dirty && (
          <button
            type="button"
            onClick={() => { setForm(toForm(saved)); setProblems([]); }}
            className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 hover:text-black"
          >
            Discard changes
          </button>
        )}
        {saved && !dirty && (
          <span className="text-[10px] text-neutral-400">Edit anything above and the button will save your changes first.</span>
        )}
      </div>
    </section>
  );
}
