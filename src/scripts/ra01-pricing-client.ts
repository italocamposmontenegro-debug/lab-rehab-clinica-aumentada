import { activePricing } from '../config/ra01-pricing.mjs';

type PriceState = ReturnType<typeof activePricing>;
let lastState: PriceState | null = null;
let receivedAt = 0;
let timer: ReturnType<typeof setTimeout>;

function render(state: PriceState) {
  document.querySelectorAll<HTMLElement>('[data-ra-price]').forEach(el => { el.textContent = state.label + (el.dataset.raPrice === 'with-currency' ? ' CLP' : ''); });
  document.querySelectorAll<HTMLElement>('[data-ra-promo]').forEach(el => { el.hidden = !state.promotion; });
  document.querySelectorAll<HTMLElement>('[data-registration-cta]').forEach(el => { el.textContent = `INSCRIBIRME Y PAGAR · ${state.label}`; });
  document.querySelectorAll<HTMLButtonElement>('[data-bank-copy-all]').forEach(el => { el.dataset.copyValue = el.dataset.copyValue?.replace(/Monto: [^\n]+/, `Monto: ${state.label} CLP`); });
  const fallback = document.querySelector<HTMLAnchorElement>('[data-ra-flow-fallback]');
  if (fallback) { fallback.href = state.paymentUrl!; fallback.textContent = `PAGAR AHORA · ${state.label}`; }
}

async function refreshPricing() {
  let state: PriceState;
  try {
    const response = await fetch('/formacion/ra01/precio', { cache: 'no-store' });
    if (!response.ok) throw new Error('Pricing unavailable');
    const data = await response.json();
    // Ignore malformed responses; destinations come only from the local schedule.
    if (!Number.isFinite(data.serverNow)) throw new Error('Invalid server time');
    state = activePricing(data.serverNow);
  } catch {
    state = activePricing(lastState ? lastState.serverNow + (performance.now() - receivedAt) : Date.now());
  }
  lastState = state; receivedAt = performance.now(); render(state);
  clearTimeout(timer);
  if (state.nextChange) timer = setTimeout(refreshPricing, Math.min(2147483647, Math.max(1000, state.nextChange - state.serverNow + 100)));
  if (document.querySelector('[data-ra-payment-redirect="enabled"]')) location.replace(state.paymentUrl!);
}

if (document.querySelector('[data-ra-price], [data-ra-payment-redirect="enabled"]')) {
  void refreshPricing();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) void refreshPricing(); });
}
