import test from 'node:test';
import assert from 'node:assert/strict';
import { activePricing, pricing } from '../src/config/ra01-pricing.mjs';
import { paymentResponse } from '../functions/formacion/ra01/pagar.js';

const boundaries = [
  ['2026-10-04T20:52:31.999-03:00', 39000, pricing.regularPaymentUrl],
  ['2026-10-04T20:52:32-03:00', 29000, pricing.promoPaymentUrl],
  ['2026-10-07T23:59:59.999-03:00', 29000, pricing.promoPaymentUrl],
  ['2026-10-08T00:00:00-03:00', 39000, pricing.regularPaymentUrl],
];
for (const [date, price, url] of boundaries) {
  test(`Santiago ${date}: ${price} CLP`, () => {
    const state = activePricing(Date.parse(date));
    assert.equal(state.price, price);
    assert.equal(state.paymentUrl, url);
    assert.equal(new Intl.DateTimeFormat('en-CA', { timeZone: pricing.timezone, hour:'2-digit', minute:'2-digit', hourCycle:'h23' }).format(Date.parse(date)), date.slice(11,16));
  });
  test(`Flow routing at ${date}`, async () => {
    const response = paymentResponse(Date.parse(date));
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), url);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.match(await response.text(), new RegExp(price === 29000 ? '\\$29\\.000' : '\\$39\\.000'));
  });
}
test('Promotion is active before midnight and keeps the fixed Santiago cutoff', () => {
  const state = activePricing('2026-10-04T23:59:59-03:00');
  assert.equal(state.price, 29000);
  assert.equal(state.nextChange, Date.parse('2026-10-08T00:00:00-03:00'));
  assert.equal(activePricing('2026-10-08T00:00:00-03:00').nextChange, null);
});
test('Closed environment cannot redirect to a payment', () => {
  const response = paymentResponse(Date.parse(pricing.promoStart), false);
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('location'), null);
});
test('Distinct reusable official Flow buttons', () => {
  assert.notEqual(pricing.regularPaymentUrl, pricing.promoPaymentUrl);
  for (const value of [pricing.regularPaymentUrl, pricing.promoPaymentUrl]) {
    const url = new URL(value);
    assert.equal(url.origin, 'https://www.flow.cl');
    assert.equal(url.pathname, '/btn.php');
    assert.match(url.searchParams.get('token'), /^[a-zA-Z0-9]{40}$/);
  }
});
test('Invalid dates cannot silently select a payment', () => {
  assert.throws(() => activePricing(NaN), TypeError);
});
