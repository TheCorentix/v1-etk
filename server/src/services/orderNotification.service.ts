import { OrderDocument, WhatsAppLogEntry } from '../repositories/order.repository';
import { WhatsAppService, normalizePhone } from './whatsapp.service';
import { logger } from '../config/logger';

type OrderStatus = OrderDocument['orderStatus'];

// WhatsApp only allows business-initiated messages through pre-approved templates.
// Each template below must be created and approved in Meta Business Manager with exactly
// this body text — see server/docs/whatsapp-templates.md.
const TEMPLATES: Partial<Record<OrderStatus, { name: string; body: string }>> = {
  CONFIRMED: {
    name: 'etniko_order_confirmed',
    body: 'Hi {{1}}, thank you for shopping with ETNIKO! Your order {{2}} for {{3}} is confirmed. We will keep you posted as it is prepared and shipped.',
  },
  PACKED: {
    name: 'etniko_order_packed',
    body: 'Hi {{1}}, your ETNIKO order {{2}} has been packed and is getting ready to ship.',
  },
  SHIPPED: {
    name: 'etniko_order_shipped',
    body: 'Hi {{1}}, your ETNIKO order {{2}} has been shipped! Tracking ID: {{3}}. Estimated delivery: {{4}}.',
  },
  DELIVERED: {
    name: 'etniko_order_delivered',
    body: 'Hi {{1}}, your ETNIKO order {{2}} has been delivered. We hope you love it! Thank you for choosing ETNIKO.',
  },
  CANCELLED: {
    name: 'etniko_order_cancelled',
    body: 'Hi {{1}}, your ETNIKO order {{2}} has been cancelled. If you have any questions, please reach out to us and we will be happy to help.',
  },
};

/** Statuses that trigger a customer message (NEW is only a pending-payment placeholder). */
export const isNotifiableStatus = (status: string): status is OrderStatus => status in TEMPLATES;

// Same short reference shown on the invoice (INV-2026-<first 8 chars of the order ID>)
const orderRef = (order: OrderDocument): string => `#${(order.id || '').slice(0, 8).toUpperCase()}`;

const firstName = (order: OrderDocument): string =>
  (order.customerName || order.shippingAddress?.name || 'there').trim().split(/\s+/)[0];

const formatRupees = (paise: number): string => `₹${(paise / 100).toLocaleString('en-IN')}`;

// Template variable values, in the order of {{1}}, {{2}}, … in the template bodies above
const buildParams = (order: OrderDocument, status: OrderStatus): string[] => {
  const base = [firstName(order), orderRef(order)];
  switch (status) {
    case 'CONFIRMED':
      return [...base, formatRupees(order.total)];
    case 'SHIPPED':
      return [...base, order.trackingNumber || 'will be shared shortly', order.shippingEta || '3–7 days'];
    default:
      return base;
  }
};

const renderBody = (body: string, params: string[]): string =>
  body.replace(/\{\{(\d+)\}\}/g, (_match, index) => params[Number(index) - 1] ?? '');

export class OrderNotificationService {
  private whatsApp = new WhatsAppService();

  /**
   * Sends the WhatsApp message for an order reaching `status` and returns a log entry.
   * Never throws, and never blocks the order update: problems are reported in the entry.
   */
  async notify(order: OrderDocument, status: OrderStatus): Promise<WhatsAppLogEntry> {
    const entry: WhatsAppLogEntry = { status, result: 'skipped', sentAt: new Date().toISOString() };

    try {
      const template = TEMPLATES[status];
      if (!template) {
        entry.error = `No customer message is defined for status ${status}.`;
        return entry;
      }

      const to = normalizePhone(order.customerPhone || order.shippingAddress?.phone, order.shippingAddress?.country);
      if (!to) {
        entry.error = 'No valid phone number on this order.';
        return entry;
      }
      entry.to = to;

      const params = buildParams(order, status);

      if (!this.whatsApp.isConfigured) {
        entry.error = 'WhatsApp is not configured yet, so nothing was sent.';
        logger.info(`💬 [WhatsApp dry run] to ${to} (${template.name}): ${renderBody(template.body, params)}`);
        return entry;
      }

      const sent = await this.whatsApp.sendTemplate(to, template.name, params);
      entry.result = sent.result;
      if (sent.messageId) entry.messageId = sent.messageId;
      if (sent.error) entry.error = sent.error;
      if (sent.result === 'sent') {
        logger.info(`💬 WhatsApp ${status} message sent for order ${order.id} (${template.name}).`);
      }
    } catch (err: any) {
      entry.result = 'failed';
      entry.error = err?.message || 'Unexpected error while sending the WhatsApp message.';
      logger.error(`WhatsApp notification error for order ${order.id}:`, err);
    }

    return entry;
  }
}
