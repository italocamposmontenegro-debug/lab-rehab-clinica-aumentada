import {ra01} from '../../../../../config/ra01.config';
import {fullPolicyText} from '../../../../../data/ra01-policies';
import {legacyVersion,legacyTermsText} from '../../../../../data/ra01-legacy.mjs';
export function getStaticPaths(){return [{params:{version:ra01.termsVersion}},{params:{version:legacyVersion}}];}
export function GET({params}:{params:{version:string}}){
  const version=params.version;
  const text=version===legacyVersion?legacyTermsText():fullPolicyText();
  return new Response(text,{headers:{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':`attachment; filename="RA01-condiciones-${version}.txt"`}});
}
