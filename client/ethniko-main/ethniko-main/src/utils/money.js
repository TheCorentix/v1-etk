// Money helpers for invoices. Amounts are whole paise (Rs 1 = 100 paise) so totals never drift.

/** "1250.5" -> 125050. Blank counts as 0; anything that isn't a valid non-negative amount gives NaN. */
export const rupeesToPaise = (value) => {
  const text = String(value ?? '').trim();
  if (text === '') return 0;
  if (!/^\d*\.?\d{0,2}$/.test(text) || text === '.') return NaN;
  return Math.round(Number(text) * 100);
};

/** 125050 -> "1250.5" (for editing in an input) */
export const paiseToRupeesText = (paise) => {
  const rupees = (paise || 0) / 100;
  return Number.isInteger(rupees) ? String(rupees) : rupees.toFixed(2);
};

/** 125050 -> "₹1,250.50"; pass 'Rs. ' where the font can't draw the rupee sign (PDF). */
export const formatMoney = (paise, symbol = '₹') =>
  `${symbol}${((paise || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Works out the amounts on an invoice form. Blank or invalid fields count as 0 here so the totals
 * can update live; `valid` tells whether every field is a usable number.
 */
export const computeInvoice = (items, discountText, shippingText) => {
  let valid = true;
  const lines = items.map((item) => {
    const quantity = /^\d+$/.test(String(item.quantity).trim()) ? Number(item.quantity) : NaN;
    const unitPrice = rupeesToPaise(item.unitPrice);
    if (Number.isNaN(quantity) || quantity < 1 || Number.isNaN(unitPrice)) valid = false;
    const safeQty = Number.isNaN(quantity) ? 0 : quantity;
    const safePrice = Number.isNaN(unitPrice) ? 0 : unitPrice;
    return { quantity: safeQty, unitPrice: safePrice, amount: safeQty * safePrice };
  });

  const discountRaw = rupeesToPaise(discountText);
  const shippingRaw = rupeesToPaise(shippingText);
  if (Number.isNaN(discountRaw) || Number.isNaN(shippingRaw)) valid = false;
  const discount = Number.isNaN(discountRaw) ? 0 : discountRaw;
  const shipping = Number.isNaN(shippingRaw) ? 0 : shippingRaw;

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  return { lines, subtotal, discount, shipping, total: subtotal - discount + shipping, valid };
};
