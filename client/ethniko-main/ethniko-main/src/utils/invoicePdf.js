import { formatMoney } from './money';

// Who the invoice is from. Matches the studio details in the website footer; edit here if they change.
export const INVOICE_COMPANY = {
  name: 'ETNIKO Designer Studio',
  addressLines: ['Plot 540, Road No. 36, Jubilee Hills,', 'Near Metro Station, Hyderabad,', 'Telangana, 500033'],
  phone: '+91 98300 12345 / +91 40 4567 8910',
  email: 'stylist@etniko.studio',
};

const GOLD = [182, 141, 64];
const BRIGHT_GOLD = [212, 175, 55];
const INK = [24, 24, 24];
const MUTED = [110, 110, 110];
const RULE = [226, 220, 208];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const RIGHT = PAGE_W - MARGIN;
const BOTTOM = 270; // content stops here; the footer sits below

// The built-in PDF fonts can't draw the rupee sign, so the PDF writes "Rs. "
const money = (paise) => formatMoney(paise, 'Rs. ');

const prettyDate = (isoDate) => {
  const [year, month, day] = String(isoDate).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const invoiceFileName = (invoice, customer) => {
  const who = String(customer?.name || 'customer').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `${invoice.number}${who ? `-${who}` : ''}.pdf`;
};

/**
 * Lays out an invoice as an A4 PDF and returns the jsPDF document.
 * Kept free of browser-only code so it can be tested in Node.
 *
 * @param {object} args
 * @param {Function} args.jsPDF the jsPDF constructor
 * @param {object} args.invoice the saved invoice (amounts in paise)
 * @param {object} args.customer { name, phone, email, address, reference }
 * @param {object} [args.company] defaults to INVOICE_COMPANY
 * @param {string|null} [args.logoDataUrl] PNG data URL of the logo (a text wordmark is used without it)
 */
export function buildInvoicePdf({ jsPDF, invoice, customer, company = INVOICE_COMPANY, logoDataUrl = null }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const setText = (color) => doc.setTextColor(color[0], color[1], color[2]);
  const setFill = (color) => doc.setFillColor(color[0], color[1], color[2]);
  const setStroke = (color) => doc.setDrawColor(color[0], color[1], color[2]);
  const label = (text, x, y) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    setText(GOLD);
    doc.text(text, x, y, { charSpace: 0.6 });
  };

  // ---- Header band (black, like the website header)
  setFill(INK);
  doc.rect(0, 0, PAGE_W, 42, 'F');
  if (logoDataUrl) {
    const { width, height } = doc.getImageProperties(logoDataUrl);
    const logoH = 32;
    doc.addImage(logoDataUrl, 'PNG', MARGIN, 5, logoH * (width / height), logoH);
  } else {
    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    setText(BRIGHT_GOLD);
    doc.text('ETNIKO', MARGIN, 24);
  }
  doc.setFont('times', 'normal');
  doc.setFontSize(28);
  setText(BRIGHT_GOLD);
  doc.text('INVOICE', RIGHT, 19, { align: 'right', charSpace: 1.2 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(225, 225, 225);
  doc.text(`Invoice no: ${invoice.number}`, RIGHT, 28, { align: 'right' });
  doc.text(`Date: ${prettyDate(invoice.date)}`, RIGHT, 33, { align: 'right' });

  // ---- Billed to / From
  let leftY = 56;
  label('BILLED TO', MARGIN, leftY);
  leftY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  setText(INK);
  doc.text(String(customer.name || ''), MARGIN, leftY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  setText(MUTED);
  const customerLines = [
    customer.phone,
    customer.email,
    ...(customer.address ? doc.splitTextToSize(String(customer.address), 85) : []),
  ].filter(Boolean);
  customerLines.forEach((line) => {
    leftY += 5;
    doc.text(String(line), MARGIN, leftY);
  });
  if (customer.reference) {
    leftY += 7;
    doc.setFontSize(8);
    doc.text(`Request ref: ${customer.reference}`, MARGIN, leftY);
  }

  const fromX = 115;
  let rightY = 56;
  label('FROM', fromX, rightY);
  rightY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  setText(INK);
  doc.text(company.name, fromX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  setText(MUTED);
  [...company.addressLines, company.phone, company.email].forEach((line) => {
    rightY += 5;
    doc.text(line, fromX, rightY);
  });

  // ---- Items table
  const colQty = 136;
  const colPrice = 166;
  const drawTableHeader = (y) => {
    setFill(INK);
    doc.rect(MARGIN, y, RIGHT - MARGIN, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setText(BRIGHT_GOLD);
    doc.text('#', MARGIN + 3, y + 5.8);
    doc.text('ITEM', MARGIN + 12, y + 5.8);
    doc.text('NOS', colQty, y + 5.8, { align: 'right' });
    doc.text('COST', colPrice, y + 5.8, { align: 'right' });
    doc.text('AMOUNT', RIGHT - 3, y + 5.8, { align: 'right' });
    return y + 9;
  };

  let y = drawTableHeader(Math.max(leftY, rightY) + 12);
  invoice.items.forEach((item, index) => {
    const nameLines = doc.splitTextToSize(item.name, 92);
    const rowH = Math.max(10, nameLines.length * 4.6 + 5);
    if (y + rowH > BOTTOM) {
      doc.addPage();
      y = drawTableHeader(20);
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    setText(MUTED);
    doc.text(String(index + 1), MARGIN + 3, y + 6.2);
    setText(INK);
    doc.text(nameLines, MARGIN + 12, y + 6.2);
    doc.text(String(item.quantity), colQty, y + 6.2, { align: 'right' });
    doc.text(money(item.unitPrice), colPrice, y + 6.2, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(money(item.amount), RIGHT - 3, y + 6.2, { align: 'right' });
    setStroke(RULE);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, y + rowH, RIGHT, y + rowH);
    y += rowH;
  });

  // ---- Totals (kept together on one page)
  if (y + 46 > BOTTOM) {
    doc.addPage();
    y = 20;
  }
  y += 9;
  const labelX = 128;
  const valueX = RIGHT - 3;
  const totalRow = (text, value, { bold = false } = {}) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(10);
    setText(bold ? INK : MUTED);
    doc.text(text, labelX, y);
    setText(INK);
    doc.text(value, valueX, y, { align: 'right' });
    y += 7;
  };
  totalRow('Subtotal', money(invoice.subtotal));
  totalRow('Discount', invoice.discount > 0 ? `- ${money(invoice.discount)}` : money(0));
  totalRow('Shipping', money(invoice.shipping));

  setStroke(GOLD);
  doc.setLineWidth(0.6);
  doc.line(labelX - 4, y - 2, RIGHT, y - 2);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  setText(INK);
  doc.text('TOTAL', labelX, y);
  doc.text(money(invoice.total), valueX, y, { align: 'right' });

  // ---- Footer + page numbers on every page
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    setStroke(RULE);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, 280, RIGHT, 280);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    setText(MUTED);
    doc.text('Thank you for choosing ETNIKO.', PAGE_W / 2, 285, { align: 'center' });
    doc.setFontSize(7.5);
    doc.text('This is a computer-generated invoice and does not require a signature.', PAGE_W / 2, 289.5, { align: 'center' });
    if (pages > 1) doc.text(`Page ${page} of ${pages}`, RIGHT, 289.5, { align: 'right' });
  }

  return doc;
}
