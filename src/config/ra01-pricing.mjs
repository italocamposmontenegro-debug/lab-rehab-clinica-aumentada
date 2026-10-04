// One schedule for the page, transfers and server-side Flow routing.
export const pricing = Object.freeze({
  regularPrice: 39000,
  promoPrice: 29000,
  promoStart: '2026-10-04T20:52:32-03:00',
  // Exclusive end: the whole minute 23:59 on October 7 is promotional.
  promoEnd: '2026-10-08T00:00:00-03:00',
  timezone: 'America/Santiago',
  regularPaymentUrl: 'https://www.flow.cl/btn.php?token=b028816d76d891964d95c26243d4eb668f36bfb2',
  promoPaymentUrl: 'https://www.flow.cl/btn.php?token=ub0faf1f463ed4da4af6dff18f78223b502df723',
});

export const formatPrice = (price) => new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
}).format(price);

export function activePricing(now = Date.now()) {
  const time = new Date(now).getTime();
  if (!Number.isFinite(time)) throw new TypeError('Invalid pricing date');
  const start = Date.parse(pricing.promoStart);
  const end = Date.parse(pricing.promoEnd);
  // Never advertise a promotional amount before its Flow button is verified.
  const promotion = Boolean(pricing.promoPaymentUrl) && time >= start && time < end;
  const price = promotion ? pricing.promoPrice : pricing.regularPrice;
  return {
    price, label: formatPrice(price), promotion,
    paymentUrl: promotion ? pricing.promoPaymentUrl : pricing.regularPaymentUrl,
    nextChange: time < start ? start : time < end ? end : null,
    serverNow: time,
  };
}
