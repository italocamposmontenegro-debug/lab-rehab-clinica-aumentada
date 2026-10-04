import { activePricing } from '../../../src/config/ra01-pricing.mjs';

// The edge clock also prices the HTML when JavaScript is disabled or the
// visitor's computer has an incorrect clock. Only these RA01 pages are routed.
export async function onRequestGet({ next, env }) {
  const response = await next();
  if (env.RA01_COMMERCE_BUILD !== '1' || !response.headers.get('content-type')?.includes('text/html')) return response;
  const state = activePricing();
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store');
  headers.delete('etag');
  const html = new Response(response.body, { status: response.status, headers });
  return new HTMLRewriter()
    .on('[data-ra-price]', { element(el) { el.setInnerContent(state.label + (el.getAttribute('data-ra-price') === 'with-currency' ? ' CLP' : '')); } })
    .on('[data-ra-promo]', { element(el) { if (state.promotion) el.removeAttribute('hidden'); else el.setAttribute('hidden', ''); } })
    .on('[data-registration-cta]', { element(el) { el.setInnerContent(`INSCRIBIRME Y PAGAR · ${state.label}`); } })
    .on('[data-bank-copy-all]', { element(el) { el.setAttribute('data-copy-value', (el.getAttribute('data-copy-value') ?? '').replace(/Monto: [^\n]+/, `Monto: ${state.label} CLP`)); } })
    .transform(html);
}
