import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass = (hasError) =>
  `w-full bg-white border px-3 py-2 text-xs font-sans text-neutral-800 focus:outline-none focus:border-[#B68D40] ${
    hasError ? 'border-red-500' : 'border-neutral-300'
  }`;

// Editable text fields. `legacy` ones only appear when an older request already has a value.
const CONTACT_FIELDS = [
  { key: 'customerName', label: 'Customer name', required: true },
  { key: 'phone', label: 'Phone', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'whatsappNumber', label: 'WhatsApp' },
];
const LEGACY_FIELDS = [
  { key: 'colorPref', label: 'Colour' },
  { key: 'budgetRange', label: 'Budget' },
  { key: 'deliveryDate', label: 'Delivery date' },
];
const ALL_KEYS = [
  ...CONTACT_FIELDS.map((f) => f.key), 'address', 'fabricPref', 'notes', ...LEGACY_FIELDS.map((f) => f.key),
];

const asText = (value) => (value === null || value === undefined ? '' : String(value));

function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] uppercase tracking-wider text-neutral-400 block">
        {label} {required && <span className="text-[#B68D40]">*</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
}

function ReadOnly({ label, value }) {
  return (
    <div className="space-y-0.5">
      <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">{label}</span>
      <span className="font-semibold text-neutral-800 break-words">{value || '—'}</span>
    </div>
  );
}

/**
 * Admin window for one customisation / tailoring request: every detail can be edited and saved,
 * and the team can log internal comments (e.g. after contacting the customer).
 */
export default function CustomisationRequestDetail({
  request,
  isTailoring,
  statusActions,
  statusLabels,
  onStatusChange,
  onUpdated,
  onClose,
}) {
  const [draft, setDraft] = useState(() =>
    Object.fromEntries(ALL_KEYS.map((key) => [key, asText(request[key])]))
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);

  // Only the fields whose value differs from what is saved
  const changes = {};
  ALL_KEYS.forEach((key) => {
    if (draft[key].trim() !== asText(request[key]).trim()) changes[key] = draft[key].trim();
  });
  const dirty = Object.keys(changes).length > 0;

  const setField = (key) => (e) => {
    setDraft((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const requestClose = () => {
    if (dirty && !window.confirm('You have unsaved changes. Close without saving?')) return;
    onClose();
  };

  const handleSave = async () => {
    const found = {};
    if ('customerName' in changes && changes.customerName.length < 2) found.customerName = 'Name must be at least 2 characters.';
    if ('phone' in changes && changes.phone.replace(/\D/g, '').length < 10) found.phone = 'Enter a valid 10-digit phone number.';
    if ('email' in changes && !EMAIL_PATTERN.test(changes.email)) found.email = 'Enter a valid email address.';
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      const updated = await adminService.updateCustomization(request.id, changes);
      onUpdated(updated);
      toast.success('Request details saved.');
    } catch (err) {
      console.error(err);
      toast.error(err?.errors?.[0]?.message || err?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    const text = comment.trim();
    if (!text) return;
    setPosting(true);
    try {
      const updated = await adminService.addCustomizationComment(request.id, text);
      onUpdated(updated);
      setComment('');
      toast.success('Comment added.');
    } catch (err) {
      console.error(err);
      toast.error(err?.errors?.[0]?.message || err?.message || 'Failed to add the comment.');
    } finally {
      setPosting(false);
    }
  };

  const comments = [...(request.comments || [])].reverse(); // newest first
  const legacyToShow = LEGACY_FIELDS.filter((f) => asText(request[f.key]) || draft[f.key]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={requestClose}>
      <div
        className="bg-white border border-[#D9C7A3] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start gap-4 p-5 border-b border-neutral-200 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-serif text-lg tracking-wider text-neutral-900">
              {isTailoring ? 'Tailoring Request' : 'Outfit Customisation Request'}
            </h3>
            <span className="font-mono text-[11px] text-[#B68D40]">{request.id}</span>
          </div>
          <button onClick={requestClose} className="text-neutral-400 hover:text-neutral-900 text-xl leading-none" aria-label="Close">
            ×
          </button>
        </div>

        <div className="p-5 space-y-6 text-xs font-sans">
          {/* Status + actions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] uppercase tracking-wider text-neutral-400">Status:</span>
            <span className="px-2 py-0.5 bg-[#B68D40] text-white text-[9px] font-bold uppercase">
              {statusLabels[request.status] || request.status}
            </span>
            <div className="flex gap-1.5 ml-auto">
              {statusActions.map((a) => (
                <button
                  key={a.value}
                  onClick={() => onStatusChange(request.id, a.value)}
                  className={`px-2.5 py-1 border text-[8px] uppercase tracking-wider font-bold ${
                    request.status === a.value
                      ? 'bg-[#B68D40] text-white border-[#B68D40]'
                      : 'border-neutral-300 text-neutral-500 hover:border-[#B68D40] hover:text-[#B68D40]'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer details */}
          <section className="space-y-4">
            <h4 className="text-[10px] tracking-widest text-[#B68D40] font-semibold uppercase border-b pb-1.5">Customer details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CONTACT_FIELDS.map((f) => (
                <Field key={f.key} label={f.label} required={f.required} error={errors[f.key]}>
                  <input type="text" value={draft[f.key]} onChange={setField(f.key)} className={inputClass(errors[f.key])} />
                </Field>
              ))}
            </div>
            <Field label="Address">
              <textarea rows={2} value={draft.address} onChange={setField('address')} className={inputClass(false)} />
            </Field>
          </section>

          {/* Request details */}
          <section className="space-y-4">
            <h4 className="text-[10px] tracking-widest text-[#B68D40] font-semibold uppercase border-b pb-1.5">Request details</h4>
            <div className="grid grid-cols-2 gap-4">
              <ReadOnly label="Request type" value={request.occasion} />
              <ReadOnly label="Submitted" value={request.createdAt ? new Date(request.createdAt).toLocaleString() : ''} />
              {request.productSku && <ReadOnly label="Product SKU" value={request.productSku} />}
            </div>
            <Field label="Fabric details">
              <textarea rows={2} value={draft.fabricPref} onChange={setField('fabricPref')} className={inputClass(false)} />
            </Field>
            <Field label={isTailoring ? 'About the outfit they need' : "Customer's idea / notes"}>
              <textarea rows={5} value={draft.notes} onChange={setField('notes')} className={inputClass(false)} />
            </Field>
            {legacyToShow.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {legacyToShow.map((f) => (
                  <Field key={f.key} label={f.label}>
                    <input type="text" value={draft[f.key]} onChange={setField(f.key)} className={inputClass(false)} />
                  </Field>
                ))}
              </div>
            )}

            {Array.isArray(request.images) && request.images.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">Reference images</span>
                <div className="flex flex-wrap gap-2">
                  {request.images.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noreferrer">
                      <img src={img} alt="" className="w-24 aspect-[3/4] object-cover border border-neutral-200" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Save bar: appears once something has been edited */}
            {dirty && (
              <div className="flex items-center justify-between gap-3 bg-[#FBF6EC] border border-[#E6DCCF] px-4 py-3">
                <span className="text-[10px] text-neutral-600">You have unsaved changes.</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setDraft(Object.fromEntries(ALL_KEYS.map((key) => [key, asText(request[key])]))); setErrors({}); }}
                    className="px-3 py-1.5 border border-neutral-300 text-[9px] uppercase tracking-widest font-bold text-neutral-600 hover:bg-white"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-1.5 bg-neutral-900 text-white text-[9px] uppercase tracking-widest font-bold hover:bg-[#B68D40] disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Comments: internal log, never shown to the customer */}
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b pb-1.5">
              <h4 className="flex items-center gap-1.5 text-[10px] tracking-widest text-[#B68D40] font-semibold uppercase">
                <MessageSquare className="w-3.5 h-3.5" />
                Comments ({comments.length})
              </h4>
              <span className="text-[9px] text-neutral-400 normal-case">Internal only: customers can't see these</span>
            </div>

            <div className="space-y-2">
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddComment(); }}
                placeholder="e.g. Called on 7 Oct. Customer wants emerald green raw silk, will share measurements on WhatsApp."
                maxLength={2000}
                className={inputClass(false)}
              />
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-neutral-400">Ctrl + Enter to post</span>
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={posting || !comment.trim()}
                  className="px-4 py-1.5 bg-neutral-900 text-white text-[9px] uppercase tracking-widest font-bold hover:bg-[#B68D40] disabled:opacity-40"
                >
                  {posting ? 'Adding…' : 'Add comment'}
                </button>
              </div>
            </div>

            {comments.length === 0 ? (
              <p className="text-neutral-400 normal-case">No comments yet. Add one after you've contacted the customer.</p>
            ) : (
              <div className="space-y-2">
                {comments.map((c) => (
                  <div key={c.id} className="bg-[#FBF6EC] border border-[#E6DCCF] p-3 space-y-1">
                    <div className="flex justify-between gap-3 text-[9px] text-neutral-400">
                      <span className="font-bold uppercase tracking-wider text-[#B68D40] break-all">{c.author}</span>
                      <span className="shrink-0">{new Date(c.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
