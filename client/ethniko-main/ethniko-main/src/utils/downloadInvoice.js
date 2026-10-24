import etnikoLogo from '../assets/etniko_logo.png';
import { buildInvoicePdf, invoiceFileName } from './invoicePdf';

let cachedLogo; // data URL once loaded (null if it couldn't be loaded)

const loadLogoDataUrl = async () => {
  if (cachedLogo !== undefined) return cachedLogo;
  try {
    const blob = await (await fetch(etnikoLogo)).blob();
    cachedLogo = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Invoice logo could not be loaded; using a text heading instead.', err);
    cachedLogo = null;
  }
  return cachedLogo;
};

/**
 * Builds the invoice PDF in the browser and saves it to the user's downloads.
 * The PDF library is loaded on demand so it doesn't weigh down the rest of the admin panel.
 */
export async function downloadInvoice(invoice, customer) {
  const [{ jsPDF }, logoDataUrl] = await Promise.all([import('jspdf'), loadLogoDataUrl()]);
  const doc = buildInvoicePdf({ jsPDF, invoice, customer, logoDataUrl });
  doc.save(invoiceFileName(invoice, customer));
}
