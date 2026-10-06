import { env } from '../config/env';
import { logger } from '../config/logger';

export interface WhatsAppSendResult {
  result: 'sent' | 'failed';
  messageId?: string;
  error?: string;
}

// Dialing codes for the countries the store ships to (see createOrderSchema)
const COUNTRY_DIAL_CODES: Record<string, string> = {
  India: '91',
  USA: '1',
  UK: '44',
  Australia: '61',
};

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Converts a phone number as typed by a customer into the digits-only international
 * format WhatsApp expects (e.g. "098765 43210" + India -> "919876543210").
 * Returns null when it can't be made into a plausible number.
 */
export const normalizePhone = (raw: string | undefined | null, country = 'India'): string | null => {
  if (!raw) return null;

  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2); // 0091… style international prefix

  const dialCode = COUNTRY_DIAL_CODES[country] || COUNTRY_DIAL_CODES.India;
  if (digits.length === 10) {
    digits = dialCode + digits; // local number without country code
  } else if (digits.startsWith('0')) {
    digits = dialCode + digits.slice(1); // local number with a leading trunk 0
  }
  // Otherwise assume the country code is already included (e.g. "+91 98765 43210")

  return digits.length >= 11 && digits.length <= 15 ? digits : null;
};

// Template variables can't contain newlines/tabs or runs of spaces, and can't be empty
const cleanParam = (value: string): string => value.replace(/\s+/g, ' ').trim().slice(0, 500) || '-';

export class WhatsAppService {
  /** True once the access token and phone number ID are set in the environment. */
  get isConfigured(): boolean {
    return Boolean(env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID);
  }

  /**
   * Sends a pre-approved template message through the WhatsApp Business Cloud API.
   * Never throws: failures come back as { result: 'failed', error }.
   */
  async sendTemplate(to: string, templateName: string, bodyParams: string[]): Promise<WhatsAppSendResult> {
    const url = `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: env.WHATSAPP_TEMPLATE_LANGUAGE },
            components: [
              {
                type: 'body',
                parameters: bodyParams.map((text) => ({ type: 'text', text: cleanParam(text) })),
              },
            ],
          },
        }),
        signal: controller.signal,
      });

      const payload: any = await response.json().catch(() => ({}));

      if (!response.ok) {
        const metaError = payload?.error;
        const error = metaError
          ? `${metaError.message || 'WhatsApp request failed'}${metaError.code ? ` (code ${metaError.code})` : ''}`
          : `WhatsApp request failed with HTTP ${response.status}`;
        logger.warn(`WhatsApp send failed for template ${templateName}: ${error}`);
        return { result: 'failed', error };
      }

      return { result: 'sent', messageId: payload?.messages?.[0]?.id };
    } catch (err: any) {
      const error = err?.name === 'AbortError' ? 'WhatsApp request timed out.' : err?.message || 'WhatsApp request failed.';
      logger.warn(`WhatsApp send error for template ${templateName}: ${error}`);
      return { result: 'failed', error };
    } finally {
      clearTimeout(timer);
    }
  }
}
