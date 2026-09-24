import {readFileSync,existsSync} from 'node:fs';

const clean = value => typeof value === 'string' && value.trim() ? value.trim() : null;
let local = {};
if (process.env.RA01_USE_LOCAL_PRIVATE === '1') {
  local = JSON.parse(readFileSync('ops/ra01/private/datos-produccion.json', 'utf8'));
}
const publicIdentityPath='docs/ra01/contratos/2026-09-24.1/identity.public.json';
const publicIdentity=existsSync(publicIdentityPath)?JSON.parse(readFileSync(publicIdentityPath,'utf8')):{};

const pick = (env, fallback) => clean(process.env[env]) ?? clean(fallback);
const contractSeller=local.seller??publicIdentity.seller??{};
export const contractFinal = process.env.RA01_CONTRACT_FINAL === '1' || Boolean(publicIdentity.seller);
export const commerceBuild = process.env.RA01_COMMERCE_BUILD === '1';
export const transferQa = process.env.RA01_TRANSFER_QA === '1' && commerceBuild && process.env.RA01_USE_LOCAL_PRIVATE === '1';
export const privateBuild = {
  seller: {
    legalName: pick('RA01_SELLER_NAME', contractSeller.legalName),
    rut: pick('RA01_SELLER_RUT', contractSeller.rut),
    address: pick('RA01_SELLER_ADDRESS', contractSeller.address),
    taxDocument: pick('RA01_SELLER_TAX_DOCUMENT', contractSeller.taxDocument),
  },
  bank: commerceBuild ? {
    holder: pick('RA01_BANK_HOLDER', local.bank?.holder),
    rut: pick('RA01_BANK_RUT', local.bank?.rut),
    bankName: pick('RA01_BANK_NAME', local.bank?.bank),
    accountType: pick('RA01_BANK_ACCOUNT_TYPE', local.bank?.accountType),
    accountNumber: pick('RA01_BANK_ACCOUNT_NUMBER', local.bank?.accountNumber),
    notificationEmail: pick('RA01_BANK_NOTIFICATION_EMAIL', local.bank?.notificationEmail),
  } : null,
  merchantName: commerceBuild ? pick('RA01_MERCHANT_NAME', local.merchantName) : null,
  transbankPaymentUrl: commerceBuild ? pick('RA01_TRANSBANK_PAYMENT_URL', local.transbankPaymentUrl) : null,
};

if (contractFinal && Object.entries(privateBuild.seller).some(([, value]) => !value)) {
  throw new Error('RA01 contract build requires complete seller identity; values are not logged.');
}
if (commerceBuild && (!contractFinal || !privateBuild.bank || Object.values(privateBuild.bank).slice(0, 5).some(value => !value))) {
  throw new Error('RA01 commerce build requires finalized contract and bank details; values are not logged.');
}
