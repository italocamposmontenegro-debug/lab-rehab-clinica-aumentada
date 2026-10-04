import { activePricing } from '../../../src/config/ra01-pricing.mjs';

export function onRequestGet() {
  return Response.json(activePricing(), {
    headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}
