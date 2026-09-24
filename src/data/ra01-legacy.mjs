import {readFileSync} from 'node:fs';

export const legacyVersion='2026-09-22.1';
export const legacyTermsText=()=>readFileSync(`docs/ra01/contratos/${legacyVersion}/condiciones.txt`,'utf8').replace(/\r\n/g,'\n');
export const legacyPolicyTexts=()=>legacyTermsText().trim().split(/\n\n={32}\n\n/);
