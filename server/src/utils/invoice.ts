import { httpError } from './httpError';

// All money in an invoice is stored as whole paise (₹1 = 100 paise) so totals never drift.

export interface InvoiceLineInput {
  name: string;
  quantity: number;
  unitPrice: number; // paise per unit
}

export interface InvoiceLine extends InvoiceLineInput {
  amount: number; // quantity x unitPrice, paise
}

export interface InvoiceTotals {
  items: InvoiceLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

/**
 * Works out every amount on an invoice from the items, discount and shipping.
 * The server always recomputes these: totals sent by the browser are never trusted.
 */
export const computeInvoiceTotals = (
  items: InvoiceLineInput[],
  discount: number,
  shipping: number
): InvoiceTotals => {
  const lines: InvoiceLine[] = items.map((item) => ({
    name: item.name.trim(),
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    amount: item.quantity * item.unitPrice,
  }));

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  if (discount > subtotal) {
    throw httpError(400, "The discount can't be more than the subtotal.");
  }

  return { items: lines, subtotal, discount, shipping, total: subtotal - discount + shipping };
};

/** e.g. (2026, 7) -> "INV-2026-0007" */
export const formatInvoiceNumber = (year: number, sequence: number): string =>
  `INV-${year}-${String(sequence).padStart(4, '0')}`;
