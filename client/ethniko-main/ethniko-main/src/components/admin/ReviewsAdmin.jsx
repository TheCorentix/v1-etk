import React, { useEffect, useState } from 'react';
import { BadgeCheck, MessageSquare, RefreshCw, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewService } from '../../services/reviewService';

const FILTERS = [
  { key: 'PENDING', label: 'Waiting for approval' },
  { key: 'APPROVED', label: 'Published' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'ALL', label: 'All' },
];

const STATUS_BADGE = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
};
const STATUS_LABEL = { PENDING: 'Waiting', APPROVED: 'Published', REJECTED: 'Rejected' };

/**
 * Admin screen for moderating product reviews. Customers' reviews stay hidden until approved here.
 */
export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState({}); // review id -> true while saving

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await reviewService.getAdminReviews();
      setReviews(data.items || []);
    } catch (err) {
      console.error(err);
      setLoadError(err?.message || 'Could not load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const counts = {
    PENDING: reviews.filter((r) => r.status === 'PENDING').length,
    APPROVED: reviews.filter((r) => r.status === 'APPROVED').length,
    REJECTED: reviews.filter((r) => r.status === 'REJECTED').length,
    ALL: reviews.length,
  };
  const visible = filter === 'ALL' ? reviews : reviews.filter((r) => r.status === filter);

  const setPending = (id, on) =>
    setBusy((prev) => {
      const next = { ...prev };
      if (on) next[id] = true; else delete next[id];
      return next;
    });

  // Shows the new status straight away, then confirms with the server (and puts it back if that fails)
  const changeStatus = async (review, status) => {
    if (busy[review.id] || review.status === status) return;
    const before = review.status;
    setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, status } : r)));
    setPending(review.id, true);
    try {
      const updated = await reviewService.setReviewStatus(review.id, status);
      setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, ...updated } : r)));
      toast.success(status === 'APPROVED' ? 'Review published.' : status === 'REJECTED' ? 'Review rejected.' : 'Review moved back to waiting.');
    } catch (err) {
      console.error(err);
      setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, status: before } : r)));
      toast.error(err?.message || 'Could not update the review.');
    } finally {
      setPending(review.id, false);
    }
  };

  const remove = async (review) => {
    if (busy[review.id]) return;
    if (!window.confirm(`Delete ${review.userName}'s review of "${review.productName}"? This also deletes its photos and can't be undone.`)) return;
    setPending(review.id, true);
    try {
      await reviewService.deleteReview(review.id);
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      toast.success('Review deleted.');
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Could not delete the review.');
    } finally {
      setPending(review.id, false);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-[#B68D40]" />
          <div>
            <h3 className="font-serif text-lg tracking-wider uppercase">Product Reviews</h3>
            <p className="text-[11px] text-neutral-400">
              Only customers who bought and received a product can review it. A review shows on the shop only after you approve it.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold text-[#B68D40] hover:text-black disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-2 border text-[9px] uppercase tracking-widest font-bold transition-colors ${
              filter === f.key ? 'bg-[#B68D40] border-[#B68D40] text-white' : 'border-neutral-300 text-neutral-500 hover:border-[#B68D40] hover:text-[#B68D40]'
            }`}
          >
            {f.label} ({counts[f.key]})
          </button>
        ))}
      </div>

      {loadError && <p className="text-sm text-red-500">{loadError}</p>}

      {!loading && !loadError && visible.length === 0 && (
        <p className="py-12 text-center text-sm text-neutral-400">
          {filter === 'PENDING' ? 'Nothing is waiting for approval.' : 'No reviews here yet.'}
        </p>
      )}

      <div className="space-y-4">
        {visible.map((review) => (
          <div key={review.id} className="bg-white border border-[#E6DCCF] p-5 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <a
                  href={`/product/${review.productSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-serif text-sm font-semibold text-neutral-900 hover:text-[#B68D40]"
                >
                  {review.productName}
                </a>
                <p className="text-[11px] text-neutral-500 flex items-center gap-1.5 pt-0.5">
                  {review.userName}
                  <span className="flex items-center gap-0.5 text-[9px] text-[#3E7C59]"><BadgeCheck className="w-3 h-3" /> Verified purchase</span>
                  <span className="text-neutral-300">·</span>
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${STATUS_BADGE[review.status]}`}>
                {busy[review.id] ? 'Saving…' : STATUS_LABEL[review.status]}
              </span>
            </div>

            <div className="flex text-[#B68D40]" aria-label={`${review.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-[#B68D40]' : 'opacity-25'}`} />
              ))}
            </div>

            {review.title && <p className="text-xs font-semibold text-neutral-800">{review.title}</p>}
            <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-wrap">{review.comment}</p>

            {review.images?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {review.images.map((src) => (
                  <a key={src} href={src} target="_blank" rel="noreferrer">
                    <img src={src} alt="Customer photo" className="w-20 h-24 object-cover border border-[#E6DCCF] hover:opacity-80 transition-opacity" />
                  </a>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-100">
              {review.status !== 'APPROVED' && (
                <button
                  type="button"
                  onClick={() => changeStatus(review, 'APPROVED')}
                  disabled={Boolean(busy[review.id])}
                  className="px-3.5 py-1.5 bg-neutral-900 text-white text-[9px] uppercase tracking-widest font-bold hover:bg-[#B68D40] disabled:opacity-50 disabled:cursor-wait"
                >
                  Approve & publish
                </button>
              )}
              {review.status !== 'REJECTED' && (
                <button
                  type="button"
                  onClick={() => changeStatus(review, 'REJECTED')}
                  disabled={Boolean(busy[review.id])}
                  className="px-3.5 py-1.5 border border-neutral-300 text-neutral-600 text-[9px] uppercase tracking-widest font-bold hover:border-red-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-wait"
                >
                  {review.status === 'APPROVED' ? 'Unpublish (reject)' : 'Reject'}
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(review)}
                disabled={Boolean(busy[review.id])}
                className="ml-auto flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-neutral-400 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
