export const FALLBACK_WHATSAPP_NUMBER = '50671618029';
export const WHATSAPP_NUMBER_PLACEHOLDER = '%WHATSAPP_NUMBER%';

export function normalizeWhatsappNumber(value) {
  return String(value ?? '').replace(/\D/g, '');
}

export function resolveWhatsappNumber(value) {
  const raw = value == null ? '' : String(value).trim();
  const digits = normalizeWhatsappNumber(raw);

  if (digits) {
    return digits;
  }

  if (raw) {
    throw new Error('WHATSAPP_NUMBER must contain digits');
  }

  return FALLBACK_WHATSAPP_NUMBER;
}

export function applyWhatsappNumber(html, number) {
  return String(html).replaceAll(WHATSAPP_NUMBER_PLACEHOLDER, number);
}

export function whatsappHref(number) {
  return `https://wa.me/${number}`;
}
