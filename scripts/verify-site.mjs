import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const dist = resolve(root, 'dist');
const htmlPath = resolve(dist, 'index.html');
const failures = [];

const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

expect(existsSync(htmlPath), 'Falta dist/index.html; ejecuta npm run build antes de verificar.');

if (existsSync(htmlPath)) {
  const html = readFileSync(htmlPath, 'utf8');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const idSet = new Set(ids);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const hashLinks = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);

  expect((html.match(/<h1\b/g) ?? []).length === 1, 'La página debe contener exactamente un H1.');
  expect((html.match(/data-work-line/g) ?? []).length === 3, 'Deben existir exactamente tres líneas de trabajo.');
  expect((html.match(/data-featured-case/g) ?? []).length === 3, 'Deben existir exactamente tres casos destacados.');
  expect((html.match(/data-collaboration-route/g) ?? []).length === 3, 'Deben existir exactamente tres rutas de colaboración.');
  expect(duplicateIds.length === 0, `Hay IDs duplicados: ${[...new Set(duplicateIds)].join(', ')}`);
  expect(hashLinks.every((id) => idSet.has(id)), `Hay anchors sin destino: ${hashLinks.filter((id) => !idSet.has(id)).join(', ')}`);

  expect(html.includes('<title>Ítalo Campos | Neurorehabilitación, educación en salud e inteligencia artificial</title>'), 'El title principal no coincide con la definición canónica.');
  expect(html.includes('rel="canonical" href="https://italocampos.cl/"'), 'Falta canonical hacia https://italocampos.cl/.');
  expect(html.includes('property="og:site_name" content="Ítalo Campos"'), 'OpenGraph no usa Ítalo Campos como marca principal.');
  expect(html.includes('10.6018/edumed.715291'), 'Falta el DOI 10.6018/edumed.715291.');
  expect(html.includes('10.6018/edumed.723391'), 'Falta el DOI 10.6018/edumed.723391.');
  expect(html.includes('0009-0007-0325-3344'), 'Falta el ORCID canónico.');
  expect(html.includes('italo_campos_montenegro'), 'Falta el perfil profesional de Instagram.');
  expect(html.includes('italo-campos-montenegro-789534376'), 'Falta el perfil profesional de LinkedIn.');
  expect(html.includes('https://observatorioitd.cl/'), 'Falta el enlace al Observatorio de inclusión, territorio y discapacidad.');
  expect(html.includes('social_impact_observatory_click'), 'Falta el evento de conversión del Observatorio.');
  expect(html.includes('Felipe Herrera Miranda'), 'Falta la atribución de cocreación del Observatorio al Dr. Felipe Herrera Miranda.');
  expect(!/\baumentad[oa]s?\b/i.test(html), 'Persiste terminología aumentada/aumentado en el contenido publicado.');
  const testSalivalVideo = html.match(/<video[^>]+aria-label="Demostración en video del sistema Test Salival"[^>]*>/)?.[0] ?? '';
  expect(Boolean(testSalivalVideo), 'Falta el video demostrativo de Test Salival.');
  expect(['autoplay', 'muted', 'loop', 'playsinline'].every((attribute) => new RegExp(`\\b${attribute}(?:=|\\s|>)`).test(testSalivalVideo)), 'El video de Test Salival no conserva la configuración de reproducción automática móvil.');
  expect(!html.toLowerCase().includes('regresión lineal múltiple'), 'Persiste la metodología incorrecta: regresión lineal múltiple.');
  expect(!html.toLowerCase().includes('la intensidad de uso no fue un predictor relevante'), 'Persiste la afirmación incorrecta sobre intensidad de uso.');

  const jsonLdMatch = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  expect(Boolean(jsonLdMatch), 'Falta JSON-LD.');
  if (jsonLdMatch) {
    try {
      const schema = JSON.parse(jsonLdMatch[1]);
      const graph = Array.isArray(schema['@graph']) ? schema['@graph'] : [];
      expect(graph.some((item) => item['@type'] === 'Person'), 'JSON-LD no incluye Person.');
      expect(graph.filter((item) => item['@type'] === 'ScholarlyArticle').length === 2, 'JSON-LD debe incluir dos ScholarlyArticle.');
      expect(graph.filter((item) => item['@type'] === 'SoftwareApplication').length === 1, 'JSON-LD debe reservar SoftwareApplication para sistemas verificables.');
      const observatory = graph.find((item) => item['@type'] === 'WebSite' && item.url === 'https://observatorioitd.cl/');
      expect(Boolean(observatory), 'JSON-LD no incluye el Observatorio como WebSite.');
      expect(Array.isArray(observatory?.creator) && observatory.creator.some((creator) => creator.name === 'Felipe Herrera Miranda'), 'JSON-LD no atribuye la cocreación del Observatorio al Dr. Felipe Herrera Miranda.');
    } catch (error) {
      failures.push(`JSON-LD inválido: ${error.message}`);
    }
  }

  const assetRefs = [...html.matchAll(/(?:href|src)="(\/[^"]+)"/g)]
    .map((match) => match[1].split(/[?#]/)[0])
    .filter((value) => value !== '/');
  const missingAssets = [...new Set(assetRefs)].filter((asset) => !existsSync(resolve(dist, `.${decodeURIComponent(asset)}`)));
  expect(missingAssets.length === 0, `Faltan assets locales: ${missingAssets.join(', ')}`);
}

const robotsPath = resolve(dist, 'robots.txt');
const sitemapPath = resolve(dist, 'sitemap.xml');
expect(existsSync(robotsPath), 'Falta robots.txt en dist.');
expect(existsSync(sitemapPath), 'Falta sitemap.xml en dist.');
if (existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, 'utf8');
  expect(robots.includes('Allow: /'), 'robots.txt no permite indexación.');
  expect(robots.includes('https://italocampos.cl/sitemap.xml'), 'robots.txt apunta a un sitemap incorrecto.');
}
if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  expect(sitemap.includes('<loc>https://italocampos.cl/</loc>'), 'sitemap.xml no contiene la URL canónica.');
}

if (failures.length > 0) {
  console.error(`Verificación fallida (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Verificación del sitio completada: estructura, ciencia, SEO, anchors, schema y assets correctos.');
