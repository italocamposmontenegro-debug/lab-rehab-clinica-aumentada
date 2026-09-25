import {ra01} from '../../../../../config/ra01.config';
import {fullPolicyText} from '../../../../../data/ra01-policies';
import {historicalVersions,historicalTermsText} from '../../../../../data/ra01-legacy.mjs';
export function getStaticPaths(){return [{params:{version:ra01.termsVersion}},...historicalVersions.map(version=>({params:{version}}))];}
export function GET({params}:{params:{version:string}}){
  const version=params.version;
  const text=historicalVersions.includes(version)?historicalTermsText(version):fullPolicyText();
  return new Response(text,{headers:{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':`attachment; filename="RA01-condiciones-${version}.txt"`}});
}
