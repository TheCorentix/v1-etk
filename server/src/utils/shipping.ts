/**
 * Shipping & currency helper.
 *
 * Payment is always processed in INR (Razorpay). For international destinations
 * we compute a weight-based shipping charge in INR, then also expose the amount
 * converted to the destination currency for display.
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
  ratePerInr: number; // 1 INR = ratePerInr <currency>
}

// Supported destination countries and their (approximate) INR conversion rates.
export const CURRENCIES: Record<string, CurrencyInfo> = {
  India: { code: 'INR', symbol: '₹', ratePerInr: 1 },
  USA: { code: 'USD', symbol: '$', ratePerInr: 0.012 }, // ~₹83 / $1
  UK: { code: 'GBP', symbol: '£', ratePerInr: 0.0095 }, // ~₹105 / £1
  Australia: { code: 'AUD', symbol: 'A$', ratePerInr: 0.018 }, // ~₹55 / A$1
};

export const SHIPPING_COUNTRIES = ['India', 'USA', 'UK', 'Australia'];

// Per-kg international shipping rates in INR (approx midpoints of quoted ranges).
const RATE_EXPRESS_PER_KG = 3200; // Express small parcel: ₹2,600–3,800 (3–5 days)
const RATE_ECONOMY_PER_KG = 1800; // Economy small parcel: ₹1,400–2,200 (7–12 days)
const RATE_BULK_PER_KG = 875; // Bulk shipments 10 kg+: ₹800–950 per kg

const DOMESTIC_FLAT_PAISE = 15000; // ₹150
const FREE_SHIPPING_THRESHOLD_PAISE = 1000000; // ₹10,000

export interface ShippingResult {
  shippingPaise: number; // canonical shipping charge in INR paise (used for payment)
  weightKg: number;
  method: 'domestic' | 'economy' | 'express' | 'bulk';
  etaDays: string;
  currencyCode: string;
  currencySymbol: string;
  conversionRate: number; // INR -> destination currency
  shippingConverted: number; // shipping shown in destination currency
}

export function getCurrencyForCountry(country?: string): CurrencyInfo {
  return CURRENCIES[country || 'India'] || CURRENCIES.India;
}

/**
 * Computes the shipping charge for an order.
 * @param totalWeightKg Total order weight in kilograms
 * @param country Destination country
 * @param subtotalPaise Order subtotal in paise (drives domestic free-shipping)
 * @param method 'economy' (default) or 'express' — only applies to <10kg international
 */
export function computeShipping(
  totalWeightKg: number,
  country: string | undefined,
  subtotalPaise: number,
  method: 'economy' | 'express' = 'economy'
): ShippingResult {
  const cur = getCurrencyForCountry(country);

  // Domestic (India): free over ₹10,000, otherwise a ₹150 flat charge.
  if (!country || country === 'India') {
    const shippingPaise = subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE ? 0 : DOMESTIC_FLAT_PAISE;
    return {
      shippingPaise,
      weightKg: totalWeightKg,
      method: 'domestic',
      etaDays: '3–7 days',
      currencyCode: 'INR',
      currencySymbol: '₹',
      conversionRate: 1,
      shippingConverted: shippingPaise / 100,
    };
  }

  // International: weight-based (minimum chargeable weight 0.5kg).
  const weight = Math.max(totalWeightKg || 0, 0.5);
  let ratePerKg: number;
  let resolvedMethod: ShippingResult['method'];
  let etaDays: string;

  if (weight >= 10) {
    ratePerKg = RATE_BULK_PER_KG;
    resolvedMethod = 'bulk';
    etaDays = '7–12 days';
  } else if (method === 'express') {
    ratePerKg = RATE_EXPRESS_PER_KG;
    resolvedMethod = 'express';
    etaDays = '3–5 days';
  } else {
    ratePerKg = RATE_ECONOMY_PER_KG;
    resolvedMethod = 'economy';
    etaDays = '7–12 days';
  }

  const shippingRupees = Math.round(weight * ratePerKg);
  const shippingPaise = shippingRupees * 100;
  const shippingConverted = +(shippingRupees * cur.ratePerInr).toFixed(2);

  return {
    shippingPaise,
    weightKg: weight,
    method: resolvedMethod,
    etaDays,
    currencyCode: cur.code,
    currencySymbol: cur.symbol,
    conversionRate: cur.ratePerInr,
    shippingConverted,
  };
}

export default computeShipping;
