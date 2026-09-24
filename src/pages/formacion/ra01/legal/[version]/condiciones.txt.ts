import {ra01} from '../../../../../config/ra01.config';
import {fullPolicyText} from '../../../../../data/ra01-policies';
export function getStaticPaths(){return [{params:{version:ra01.termsVersion}}];}
export function GET(){return new Response(fullPolicyText(),{headers:{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':`attachment; filename="RA01-condiciones-${ra01.termsVersion}.txt"`}});}
