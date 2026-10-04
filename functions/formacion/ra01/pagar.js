import { activePricing } from '../../../src/config/ra01-pricing.mjs';

export function paymentResponse(now = Date.now(), enabled = true) {
  if (!enabled) return new Response('Inscripciones y pagos cerrados.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  const { label, paymentUrl } = activePricing(now);
  const body = `<!doctype html><html lang="es-CL"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Continuar al pago · RA01</title><style>body{font:16px/1.8 system-ui;background:#fafaf9;color:#171717;max-width:36rem;margin:15vh auto;padding:24px}a{color:inherit}.pay{display:block;background:#171717;color:white;padding:12px 20px;text-align:center;text-decoration:none;margin:24px 0}</style><p>Datos recibidos. Continuando al pago seguro…</p><a class="pay" href="${paymentUrl.replaceAll('&', '&amp;')}">PAGAR AHORA · ${label}</a><a href="/formacion/ra01/pago/?method=transfer">Prefiero pagar mediante transferencia</a></html>`;
  return new Response(body, {
    status: 302,
    headers: { Location: paymentUrl, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer' },
  });
}

export function onRequestGet({ env }) {
  // No user-supplied date, amount or destination can change the price.
  return paymentResponse(Date.now(), env.RA01_COMMERCE_BUILD === '1');
}
