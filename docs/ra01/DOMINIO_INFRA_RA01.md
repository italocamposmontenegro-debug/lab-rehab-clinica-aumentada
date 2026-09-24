# RA01 · auditoría de dominio e infraestructura

> **Actualización del 23-09-2026:** el corte a Cloudflare Pages ya se ejecutó y verificó. Este documento conserva la auditoría **anterior** al corte como línea base histórica; sus estados «pendiente», 404 de RA01 y diagrama «propuesto» ya no describen producción. El estado vigente, DNS antes/después y retorno constan en [CUTOVER_CLOUDFLARE_RA01.md](CUTOVER_CLOUDFLARE_RA01.md). GitHub Pages permanece configurado como retorno por al menos 48 horas.

**Fecha:** 23 de septiembre de 2026. **Alcance:** lectura de WHOIS NIC Chile, DNS público, HTTP/TLS público, configuración de GitHub y build local. **Estado:** diagnóstico parcial de la zona Cloudflare; ningún cambio en DNS, hosting ni producción. Una respuesta DNS pública de un nombre proxied muestra IP de Cloudflare, **no** el registro de origen ni todas las reglas de la zona.

## A. Estado actual

```text
NIC Chile (registro; WHOIS vigente hasta 2027-02-23 17:01:11 CLST)
  → delegación: eve.ns.cloudflare.com / edward.ns.cloudflare.com
  → Cloudflare DNS y proxy web
  → GitHub Pages (origen HTTP identificado por x-github-request-id)
  → build estático Astro 5, servido en italocampos.cl
```

El [WHOIS de NIC Chile](https://www.nic.cl/registry/Whois.do?d=italocampos.cl) muestra el dominio registrado, al titular Ítalo Campos Montenegro, NIC Chile como agente y los dos nameservers anteriores. El DNS público coincide; no se observó inconsistencia de delegación. La consulta pública DS no devolvió registro, por lo que no hay evidencia de una cadena DNSSEC activa; confirmar DNSSEC en NIC y Cloudflare antes de cualquier cambio. No se consultaron claves ni datos de acceso.

`https://italocampos.cl/` devuelve **200**. `https://www.italocampos.cl/` devuelve **301** a `https://italocampos.cl/`; ambos HTTP también devuelven **301** al apex HTTPS. El HTML tiene canonical al apex. No se observa duplicación SEO de `www`. `robots.txt` y `sitemap.xml` devuelven **200**. `/formacion` y `/formacion/ra01` devuelven **404 en producción**, coherente con que RA01 permanece en una rama local sin publicar. No interpretar el 404 como fallo de la migración.

El certificado público TLS para el apex es válido en la prueba efectuada: CN `italocampos.cl`, emisor Let's Encrypt YE2, vigencia 2026-08-20 a 2026-11-18 UTC, conexión TLS 1.3. `www` también completó HTTPS antes de redirigir. No se observó `Strict-Transport-Security` en las respuestas probadas. **No se pudo leer** el modo SSL/TLS de la zona (Flexible/Full/Full Strict), Always Use HTTPS, reglas, CAA internos ni ajustes de certificado en el panel. El navegador Codex llegó a la pantalla de inicio de sesión de Cloudflare; no había una sesión autenticada. El certificado visible al visitante no demuestra el modo de conexión Cloudflare→GitHub.

## B. Inventario DNS observable

Consultas recursivas públicas, 2026-09-23. `Sí inferido` significa que se ven direcciones de borde de Cloudflare; el estado exacto de cada fila y el origen se verifican en el panel. TTL es el **TTL de respuesta**, no necesariamente el valor configurado. No es una exportación completa de zona: DNS público no permite enumerar todos los hostnames, selectores DKIM, verificaciones ni registros enmascarados por proxy.

| Hostname | Tipo público | Destino visible / estado | Proxy / TTL | Función probable y criticidad | Durante migración |
|---|---|---|---|---|---|
| `italocampos.cl` | NS | `eve.ns.cloudflare.com`, `edward.ns.cloudflare.com` | No aplica / 21 600 s en consulta DoH | Delegación; crítica | Conservar nameservers |
| `italocampos.cl` | SOA | Cloudflare | No aplica / 1 800 s observado | Autoridad de zona; crítica | Conservar |
| `italocampos.cl` | A, AAAA | `104.21.87.130`, `172.67.143.94`; `2606:4700:3031::ac43:8f5e`, `2606:4700:3035::6815:5782` | Sí inferido / 300 s | Entrada web apex; crítica | **Única familia candidata al corte**, tras registrar tipo, destino y proxy originales desde panel; no copiar estas IP como origen |
| `www.italocampos.cl` | A, AAAA | Mismas IP de borde | Sí inferido / 300 s | Entrada `www`, hoy redirige 301 vía origen GitHub; crítica | Conservar mientras GitHub siga activo; sustituir sólo tras probar redirect Cloudflare |
| `handmov.italocampos.cl` | A observable | IP de borde Cloudflare | Sí inferido / 300 s | Sistema externo; crítica | No tocar |
| `test-salival.italocampos.cl` | A observable | IP de borde Cloudflare | Sí inferido / 300 s | Sistema externo; crítica | No tocar |
| `rehapp.italocampos.cl` | A observable | IP de borde Cloudflare | Sí inferido / 300 s | Sistema externo; crítica | No tocar |
| `italocampos.cl` | MX, TXT, CAA, SRV | Sin respuesta positiva pública en consultas hechas | Desconocido | Correo, verificaciones y emisión TLS; criticidad potencial alta | No inferir que no existan otros TXT/CAA/SRV en la zona; no eliminar nada |
| `_dmarc.italocampos.cl` | TXT | Sin respuesta positiva pública | Desconocido | DMARC si se activa correo del dominio | No tocar sin identificar función |
| `www.italocampos.cl` | CNAME | Sin respuesta CNAME pública; el proxy puede ocultar tipo/destino de origen | Desconocido | Posible enlace a GitHub Pages | Identificar en exportación de zona |
| Selectores DKIM, TXT de verificación y otros SRV | No enumerables desde fuera | **Pendiente panel Cloudflare** | Desconocido | Correo e integraciones potenciales | Preservar íntegramente |

El sitio usa `mailto:italo.campos.montenegro@gmail.com`: esa cuenta Gmail **externa** no depende del MX de `italocampos.cl`. No se observó MX ni SPF/DMARC en el apex consultado; esto **no prueba** que no haya otros servicios de correo, reenvío, autenticación o verificaciones en hostnames distintos. Antes del corte, exportar **todos** los registros de la zona con hostname, tipo, destino, proxy y TTL; clasificar MX, SPF, DKIM, DMARC y TXT de validación sin publicar tokens. No modificar ningún registro de correo.

## C. Hosting actual y build

Repositorio público: `italocamposmontenegro-debug/lab-rehab-clinica-aumentada`. La API autenticada de GitHub Pages confirmó `build_type: workflow`, `cname: italocampos.cl`, `https_enforced: true`, rama fuente `main`, URL pública `https://italocampos.cl/`. El repositorio tiene rama principal `main`; el trabajo RA01 está en `codex/ra01-sistema-comercial` con archivos aún sin commit. El GitHub `main` actual **no contiene RA01**. Las cabeceras públicas `x-github-request-id`, `via: varnish` y `x-fastly-request-id` confirman GitHub Pages como origen detrás de Cloudflare.

El workflow `.github/workflows/deploy.yml` se activa con push a `main` o manualmente: checkout, Node 20, `npm ci`, `npm run build`, carga `dist` y `actions/deploy-pages@v4`. `package.json` declara Astro `^5.17.1` (versión efectiva fijada por `package-lock.json`), Tailwind 3 y `astro check`. `astro.config.mjs`: `site: https://italocampos.cl`, `base: /`, salida estática por defecto. No hay `CNAME` en el árbol público ni variables/secretos exigidos por este workflow; el custom domain está registrado en configuración GitHub Pages. No se detectaron redirects de servidor existentes en el repositorio; las dos rutas legacy `/formacion/RA01` y `/formación/RA01` tienen HTML `noindex` con redirección cliente a la ruta canónica. El apex `www` redirige hoy desde el origen GitHub, no hay evidencia de una regla Cloudflare equivalente.

El build local ejecutado en esta auditoría pasó: 17 páginas, `npm test`, verificación del sitio y `npm run test:ra01` (13 pruebas operativas y comprobación de rutas/activos). Se generaron landing, tres demostraciones, pago, ayuda, preparación, lista de espera, condiciones, siete políticas versionadas y `condiciones.txt`, más HTML/imagen/ICS públicos. Los enlaces internos usan rutas desde `/`, sin base path GitHub específico, SPA ni dependencia de API de GitHub Pages. Las rutas `/formacion/ra01/...` se sirven desde `index.html` por carpeta; validar en Pages el slash final, los dos aliases y los 404. **No existe `/formacion/index.html` ni `404.html` propio** en el build. Cloudflare Pages puede tratar como SPA un proyecto sin `404.html`; crear/probar un 404 explícito antes del corte para evitar 200 falsos en URL inexistentes.

La página usa canonical y metadatos por ruta; la home mantiene JSON-LD `Person`, dos `ScholarlyArticle` y `SoftwareApplication`. `robots.txt` apunta a un `sitemap.xml` estático que hoy sólo incluye la home. RA01 está en modo `preview` con `noindex`, pagos y Tally desactivados; la entrada pública posterior requerirá resolver sus bloqueos comerciales y actualizar el sitemap, fuera de esta auditoría. Los enlaces a HandMov, Test Salival, RehAPP y Observatorio son externos y se deben probar después del corte.

**Revisión de exposición:** `dist` contiene 58 archivos, 89 631 080 bytes totales; archivo mayor 22 785 957 bytes (menos de 25 MiB). No contiene `ops/`, `ops/ra01/private`, ZIP del Kit, `.env`, `config.local.json` ni source maps. Los identificadores privados de Sheets y carpetas Drive presentes en `ops/ra01/config.local.json` se compararon sin imprimir valores: no aparecen en los archivos de texto del build. `.gitignore` excluye `ops/ra01/private/`, `ops/ra01/*.local.json`, `.env` y `dist/`; la lista de archivos versionados no incluye estos datos. No se detectó una exposición P0 en el build examinado. La auditoría no sustituye una revisión final de cada deploy.

## D. Problemas detectados y prioridades

| Prioridad | Hallazgo | Efecto / resolución |
|---|---|---|
| P0 | No se observó exposición real de secretos ni caída actual. | Si una revisión posterior encuentra un secreto público, detener cualquier despliegue, retirar acceso y rotarlo antes de publicar. |
| P1 | Sin sesión Cloudflare: inventario de zona, origen/proxy/TTL, SSL mode, DNSSEC y reglas sin confirmar. | **Bloquea decidir el cambio exacto y ejecutar cutover/rollback seguro.** Exportación privada de zona y capturas de ajustes, sin claves. |
| P1 | `main` público no incluye RA01; producción devuelve 404. | Integrar una revisión aprobada en Git y desplegar a `*.pages.dev` antes de añadir dominio. No publicar RA01 en esta fase. |
| P1 | `www` 301 depende hoy de GitHub Pages. | Mantener GitHub hasta sustituir y probar redirect en Cloudflare; no apagar Pages tras mover sólo apex. |
| P1 | Sin 404 propio; `/formacion` falta. | Probar semántica Pages, agregar 404 explícito y ruta formativa si se requiere antes del corte. |
| P1 | RA01 sigue `noindex` y sin Tally/pagos aprobados. | Correcto para preview; completar gates comerciales por separado antes de la activación. |
| P2 | Sitemap sólo home; alias legacy con redirect cliente. | Añadir RA01 al sitemap cuando sea indexable; probar y, si conviene, sustituir aliases por 301 de servidor en Pages. |
| P2 | HSTS ausente en respuestas observadas; modo SSL/TLS de zona desconocido. | Revisar todos los subdominios antes de cambios globales; objetivo Full (strict) donde aplique, sin activar a ciegas. |

## E. Hosting recomendado

**Cloudflare Pages, proyecto estático en plan Free**, conectado al mismo GitHub, es el destino recomendado. GitHub seguirá como repositorio; GitHub Pages sólo dejará de ser hosting público después de comprobar el nuevo destino. GitHub [restringe Pages como hosting gratuito de negocios/sitios principalmente orientados a transacciones](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits/). El sitio RA01 puede pasar a actividad pagada, por lo que mantener GitHub Pages como origen comercial es una dependencia inadecuada. Cloudflare [documenta Astro estático con `npm run build` y `dist`](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) y [GitHub con deployments de preview](https://developers.cloudflare.com/pages/configuration/git-integration/).

## F. Justificación y límites vigentes

| Criterio | Evaluación |
|---|---|
| Costo | Hosting estático Pages Free: **US$0/mes** dentro de sus límites actuales; no se requiere contratar plan. Continúan por separado renovación NIC Chile y costos que pudieran tener Tally, Zoom, Transbank u otros. Las solicitudes estáticas son [gratis e ilimitadas](https://developers.cloudflare.com/pages/functions/pricing/); Functions, si se agregaran, tienen cuota distinta. |
| Encaje técnico | El build actual es estático, 58 archivos, máximo 21,73 MiB; cabe bajo el [límite Free de 20 000 archivos y 25 MiB por archivo](https://developers.cloudflare.com/pages/platform/limits/). No se necesitan Functions ni adaptador SSR. |
| Builds | Free: 500 builds/mes, uno concurrente y timeout de 20 minutos; el build local tardó ~7 s. Confirmar consumo de la cuenta antes de crear proyecto. |
| Dominio/SSL | Free admite hasta 100 custom domains por proyecto; el apex requiere zona Cloudflare, ya delegada públicamente allí. El certificado Pages debe verificarse tras vincular dominio. Revisar CAA si la zona privada lo contiene. [Documentación](https://developers.cloudflare.com/pages/configuration/custom-domains/). |
| Mantenimiento | El mismo repo y build; Node 20 se puede fijar con `NODE_VERSION=20` para igualar GitHub Actions, pues la [imagen Pages usa Node 22 por defecto](https://developers.cloudflare.com/pages/configuration/build-image/). Sin paquete, framework ni almacenamiento nuevos. |
| Riesgo | No hay riesgo DNS durante creación/prueba de `*.pages.dev`; sí en el vínculo del dominio, que puede crear/cambiar registros. Las reglas de zona y correo aún no están inventariados. |
| Rendimiento | Pages usa distribución Cloudflare y [caché integrada](https://developers.cloudflare.com/pages/configuration/serving-pages/). No prometer mejora de LCP sin comparación bajo el mismo protocolo y ubicación. |
| Escala futura | Misma estructura `/` y `/formacion/*`; GitHub puede generar previews por rama. Sin necesidad técnica actual de otro dominio o subdominio. |

La documentación de Pages revisada no establece una prohibición de contenido comercial comparable a GitHub Pages; antes de activar cobros conviene comprobar condiciones contractuales y límites de la cuenta concreta. El plan Free cubre **hosting** de este build, no una promesa de costo total cero para la actividad.

## G. Arquitectura final propuesta

```text
NIC Chile (registro y renovación)
  ↓ nameservers existentes, sin cambiar
Cloudflare DNS / proxy / TLS
  ↓ apex italocampos.cl
Cloudflare Pages (Astro estático, dist)
  ├─ /                 sitio profesional y URLs actuales
  ├─ /formacion        entrada formativa, cuando se cree
  └─ /formacion/ra01   RA01 y rutas internas

GitHub: código, ramas, revisiones, CI y origen de builds Pages.
GitHub Pages: rollback transitorio hasta estabilidad y www resuelto.
Subdominios existentes: sin cambios de DNS ni de aplicación.
```

El hosting no procesa directamente compras ni registros: RA01 usa Tally (iframe y `postMessage` con origen `https://tally.so`) sólo cuando se habilite, Google Sheets/Drive para operación privada, Gmail para soporte, Transbank/Webpay como enlace externo y Zoom/Drive para entrega privada. La migración estática no debe tocar estos servicios. Antes de agregar CSP o `_headers`, ensayar Tally, Google Fonts, `mailto:`, enlaces Webpay, redirects y script de analítica; una CSP restrictiva podría bloquear iframe, `postMessage` o conexiones. Por ahora no implementar CSP ni reglas complejas.

## H. Plan de migración reversible

1. **A · Backup:** desde Cloudflare autenticado, exportar toda la zona y registrar además SSL/TLS, Always Use HTTPS, HSTS, reglas Redirect/Page/Cache/Origin/Workers, custom domains y DNSSEC. Guardar valores sensibles fuera del repo. Obtener evidencia de la configuración Pages de GitHub, ya consultada; congelar el commit de producción. Clasificar correo, `www` y los tres subdominios. Sin este paso no hay corte.
2. **B · Preparar código:** consolidar RA01 en commit revisado, con gating `preview`; mantener exactamente `site: https://italocampos.cl`, `base: /`. Crear/probar `404.html` y resolver `/formacion` si forma parte del alcance público. No activar Tally ni cobros. Verificar `npm ci`, `npm test`, `npm run lint`, `npm run test:ra01` y scan del build privado.
3. **C · Crear Pages sin dominio:** en Cloudflare `Workers & Pages → Create application → Pages → Import Git repository`, conceder únicamente acceso al repo necesario; proyecto estático, production branch `main`, `npm run build`, output `dist`, `NODE_VERSION=20`. Si RA01 aún está sólo en rama, habilitar preview para esa rama. No usar Direct Upload como atajo si se busca integración Git permanente. Crear el proyecto **no implica añadir `italocampos.cl`**.
4. **D/E · QA de URL temporal:** obtener `*.pages.dev` real y comparar home, publicaciones, sistemas, anchors, videos, favicon, robots, sitemap, 404, `/formacion/ra01` y cada ruta RA01; assets y alias legacy; móvil/escritorio, consola, formularios preview, accesibilidad y performance con el baseline de abajo. Confirmar que los previews tienen `X-Robots-Tag: noindex` (valor documentado por Cloudflare) y que el proyecto no publica secretos. Si el preview falla, corregir en rama sin tocar producción.
5. **F · Preparar corte:** aprobar el QA por escrito, registrar fecha/hora y responsables, recuperar export DNS y valores **de origen** de apex/www, comprobar acceso de rollback en Cloudflare y GitHub. No confundir las IP públicas de Cloudflare con las entradas de origen. `www` puede seguir redirigiendo vía GitHub durante el corte del apex.
6. **G · Vincular apex:** desde Pages → Custom domains, agregar `italocampos.cl` **sólo en ventana de corte**. El asistente puede crear/modificar automáticamente el registro DNS: comparar exactamente el cambio propuesto con el inventario y aceptar únicamente la entrada web apex necesaria. No tocar NS, DS, MX/TXT ni subdominios. Este paso es el cambio de producción; no se realizó aquí.
7. **H · Verificar:** desde más de una red/resolver, comprobar 200 del apex, TLS, 301 `www`→apex, HTTP→HTTPS, home, rutas antiguas y RA01, assets, canonical, sitemap, robots, formularios/links y métricas. Verificar que `www` no se rompe si GitHub Pages sigue activo. Revisar Cloudflare Ray y logs de Pages. No declarar cero downtime sólo por un test local; vigilar cachés DNS y propagación.
8. **I/J · Estabilizar:** mantener GitHub Pages y el workflow como ruta de retorno. Cuando el apex y `www` lleven un período de observación acordado sin errores, sustituir la redirección `www` dependiente de GitHub por una regla Cloudflare o configuración Pages comprobada; probar sus rutas y query strings. Sólo entonces retirar GitHub Pages en una operación posterior. Conservar repo GitHub e integración Pages.

**Detalle DNS del corte:** no se puede indicar hoy el tipo y valor original a reemplazar. El proxy público oculta si el apex/www usan A, AAAA o CNAME flattening y su destino GitHub; ese dato sale exclusivamente del panel/exportación de zona. Cloudflare [advierte que cambiar una entrada fuera de Pages y volver puede dejar el custom domain inactivo hasta revalidación](https://developers.cloudflare.com/pages/configuration/custom-domains/), por lo que el plan minimiza la ventana pero no garantiza formalmente cero segundos de incidencia.

**Cache:** mantener valores por defecto de Pages. Los assets Astro `_astro/*` tienen hash y son aptos para caché larga; HTML, alias y rutas de pago deben revalidarse con cada deploy, sin regla `Cache Everything`. Pages invalida sus assets al nuevo despliegue y usa ETag; si queda contenido obsoleto, inspeccionar reglas de zona y purgar selectivamente o como último recurso la zona. [Guía de serving/cache](https://developers.cloudflare.com/pages/configuration/serving-pages/). `_redirects`/`_headers` son opcionales y se preparan sólo tras detectar necesidad en preview; `_redirects` no resuelve por sí solo un redirect entre dominios como `www`→apex, que requiere regla de zona o configuración equivalente. [Guía oficial de `www`](https://developers.cloudflare.com/pages/how-to/www-redirect/).

### Línea base de producción antes del corte

Medición local de `https://italocampos.cl/`, 23-09-2026; tres contextos nuevos Edge por perfil, caché desactivada. Móvil 390×844 con RTT 150 ms, 1,6 Mbps y CPU 4×; desktop 1365×920 sin throttling. Medianes, no datos de usuarios. `transferSize` puede omitir bytes de recursos cross-origin sin Timing-Allow-Origin. Archivo crudo: `output/infra-ra01/baseline.json`.

| Perfil | HTTP | TTFB | LCP | CLS | Transferencia observada | JS | Imágenes | Errores consola |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Móvil | 200 en 3/3 | 301 ms | 2 464 ms | 0,069 | 152 187 B | 961 B | 22 824 B | 0/3 |
| Desktop | 200 en 3/3 | 245 ms | 920 ms | 0,026 | 179 081 B | 961 B | 49 718 B | 0/3 |

Repetir **idéntico protocolo** tras el corte. No comparar estos números de la home pública con las mediciones locales de RA01; no son la misma página ni entorno.

## I. Rollback

**Fallo antes de G:** no hay cambio público; mantener GitHub Pages y descartar/corregir preview.

**Fallo de una versión Pages después del corte:** si existe un deployment de producción Pages bueno, usar su función de [Rollback](https://developers.cloudflare.com/pages/configuration/rollbacks/) y comprobar dominio/rutas. Los previews no sirven como destino de rollback de producción.

**Fallo de hosting/certificado/ruteo Pages:** mantener GitHub Pages operativo; registrar respuesta de Pages y export DNS; retirar/desasociar de Pages el custom domain según el estado del panel **antes o coordinado con** restaurar exactamente los registros web apex originales (tipo, destino, proxy y TTL) desde el backup; no tocar correo, NS, DS ni subdominios; comprobar 200, 301 `www`, TLS y rutas antiguas desde varias redes. Si Cloudflare conserva una ruta/certificado asociado, resolverla en panel antes de insistir en cambios DNS. La reversión puede tardar por TTL, caché o revalidación del certificado; no se ha ensayado y no se marca como validada. Si el contenido RA01 causó el problema, mantenerlo desactivado mientras vuelve la home estable.

## J. Datos o accesos necesarios de Ítalo y siguiente acción

1. **Iniciar sesión en la cuenta Cloudflare que administra `italocampos.cl` en el navegador de trabajo, o proporcionar una exportación de zona y lectura de ajustes** DNS/SSL/TLS/Rules/Pages. No compartir contraseña, token ni clave NIC. La exportación se tratará fuera del repositorio; en el informe sólo se mostrarán valores no secretos o resúmenes de verificación.
2. Confirmar si hay correo `@italocampos.cl` o reenvío/Email Routing no visible públicamente, y quién opera los subdominios existentes. El Gmail externo sigue independiente.
3. Tras completar el inventario, aprobar una ventana de corte sólo cuando exista URL `*.pages.dev` con QA aprobado y backup comprobado. **Todavía no corresponde cambiar DNS ni retirar GitHub Pages.**

### Fuentes primarias consultadas

- [NIC Chile WHOIS del dominio](https://www.nic.cl/registry/Whois.do?d=italocampos.cl).
- [GitHub Pages: límites y uso comercial](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits/).
- [Cloudflare Pages: Astro](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/), [límites](https://developers.cloudflare.com/pages/platform/limits/), [previews](https://developers.cloudflare.com/pages/configuration/preview-deployments/), [dominios](https://developers.cloudflare.com/pages/configuration/custom-domains/), [cache](https://developers.cloudflare.com/pages/configuration/serving-pages/), [rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/).
- [Cloudflare SSL/TLS Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/).
