import {readFileSync} from 'node:fs';

export const historicalVersions=['2026-09-22.1','2026-09-24.1'];
export const historicalTermsText=version=>readFileSync(`docs/ra01/contratos/${version}/condiciones.txt`,'utf8').replace(/\r\n/g,'\n');
export const historicalPolicyTexts=version=>historicalTermsText(version).trim().split(/\n\n={32}\n\n/);
