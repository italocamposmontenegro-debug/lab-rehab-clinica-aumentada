# RA01 · corte productivo a Cloudflare Pages

**Ejecutado:** 23 de septiembre de 2026, aproximadamente 22:02 America/Santiago (24 de septiembre, 01:02 UTC). **Estado:** infraestructura web productiva operativa. Este registro documenta el corte; no activa cobros, inscripciones ni servicios comerciales.

## Destino y código

- Producción: <https://italocampos.cl/> y <https://italocampos.cl/formacion/ra01/>.
- Proyecto Cloudflare Pages: `italocampos-web`, conectado al repositorio público `italocamposmontenegro-debug/lab-rehab-clinica-aumentada`. Rama de producción `main`, commit de corte `7ab25f1`. Build Astro estático: `npm run build`, directorio `dist`, Node 20.
- URL de Pages: <https://italocampos-web.pages.dev/>. Preview de rama: <https://codex-ra01-sistema-comercial.italocampos-web.pages.dev/>.
- La publicación en GitHub fue autorizada expresamente. El commit contiene código y activos web públicos; se excluyeron `ops/ra01/private`, configuraciones locales y documentos operativos. La rama `codex/ra01-sistema-comercial` se publicó y `main` avanzó al mismo commit.

## DNS y redirección

La exportación BIND nativa previa, guardada fuera de Git en `ops/ra01/private/infra/cloudflare-zone-2026-09-23.bind.txt`, tiene SHA-256 `47801AA15D74B20120454A03D82AA9E8578D6412FBCEADA367DC75E8147E04B5`. El apex tenía cuatro A proxied con TTL Auto hacia `185.199.108.153`, `185.199.109.153`, `185.199.110.153` y `185.199.111.153`. `www` era CNAME proxied/Auto hacia `italocamposmontenegro-debug.github.io`.

El asistente de dominio personalizado de Pages propuso sustituir exclusivamente los cuatro A del apex por un CNAME proxied/Auto hacia `italocampos-web.pages.dev`; se comprobó el diferencial antes de activarlo. Pages informa el custom domain `italocampos.cl` como **Active**. Para independizar `www` de GitHub Pages se configuró una [Single Redirect de Cloudflare](https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-www-to-root/): filtro `http.host eq "www.italocampos.cl"`, destino dinámico `concat("https://italocampos.cl", http.request.uri.path)`, 301 y conservación de query string. El DNS de `www` se cambió a A `192.0.2.1` proxied/Auto, patrón de [redirect sin origen](https://developers.cloudflare.com/fundamentals/manage-domains/redirect-domain/). No se modificaron nameservers, DS, correo ni registros de otros servicios.

La exportación BIND posterior, privada, está en `ops/ra01/private/infra/cloudflare-zone-2026-09-23-after.bind.txt`, SHA-256 `7E0D38BB016586D4D6121EE974A4BAC65436DB2184A785C1971A962F6F4068DB`. La comparación programática de registros A/CNAME ajenos al apex y `www` dio 12 antes, 12 después, **cero diferencias**.

## Verificación posterior

| Área | Resultado observado |
|---|---|
| Disponibilidad | Home y RA01 HTTP 200; barrido de rutas formativas, demostraciones, ayuda, preparación, lista de espera, pago simulado, condiciones, siete políticas, robots, sitemap, favicon, imagen e ICS: 200. URL inexistente: 404. |
| Redirecciones | `http://italocampos.cl/` → HTTPS; `www` por HTTP y HTTPS → apex HTTPS 301, conservando ruta y query string, sin bucle. Aliases legacy de RA01 llegan a la ruta funcional. |
| TLS | HTTPS del apex y `www` validado por cliente sin ignorar certificados. Cloudflare mantiene el modo SSL Full observado en panel. |
| SEO | Canonical RA01 al apex; RA01 de producción declara `index, follow`; ni home ni RA01 del dominio productivo tienen `X-Robots-Tag: noindex`. `robots.txt` y `sitemap.xml` son 200; sitemap incluye home y RA01. Preview de rama: meta `noindex,nofollow` y cabecera `X-Robots-Tag: noindex`. URL `pages.dev` de producción: cabecera `X-Robots-Tag: noindex`. |
| Seguridad | CSS, JS e imágenes 200 con MIME correcto; `ops/ra01/private`, `config.local.json`, `.env`, docs operativos, ZIP del Kit y grabación privada consultados públicamente: 404. Identificadores privados ausentes del árbol publicado y build revisados. |
| UX | Navegación e interacción de demo, Kit, FAQ y pago simulado verificadas en navegador; consola sin errores observados. Viewports 1365, 768, 390 y 320 px sin desbordamiento horizontal. Sin afirmación de certificación WCAG. |
| Lighthouse, home | Previo GitHub Pages: móvil 88, LCP 2,9 s, CLS 0; escritorio 99, LCP 0,8 s, CLS 0,028. Después del corte: móvil 90, LCP 2,9 s, CLS 0; escritorio 99, LCP 0,7 s, CLS 0,028. Una ejecución PageSpeed Insights por perfil; no hay regresión material observada. |

También pasaron `npm test` y `npm run lint` para el código previo al ajuste mínimo de sitemap. Tras ese ajuste, el sitemap se validó como XML y su ruta real devolvió 200. La comprobación pública es la evidencia principal de la versión desplegada. No se introdujeron paquetes ni frameworks nuevos.

## Retorno y estabilización

GitHub Pages y su workflow permanecen configurados como retorno durante **al menos 48 horas** de estabilidad; GitHub ya no sirve el tráfico del apex. Su panel puede seguir mostrando el custom domain como «live» aunque DNS apunta ahora a Pages. La vuelta no se ha ejercitado sobre producción: restaurar los cuatro A de apex y el CNAME original de `www` desde la exportación privada, coordinar antes la desvinculación del custom domain Pages y desactivar/ajustar la regla `www`; verificar de nuevo certificado, home, redirecciones y rutas desde varias redes. Una revalidación de certificado o propagación DNS puede demorar el retorno. Si sólo falla un despliegue de Pages, preferir el rollback de un deployment productivo anterior desde Pages.

Incidencias resueltas durante el corte: la primera regla wildcard de `www` no cubría HTTP; se sustituyó por filtro de host y se comprobaron ambos esquemas. El sitemap se actualizó para incluir RA01. Incidencia menor abierta: Node 20 emite aviso de fin de soporte en el build, sin fallo de publicación; migrar runtime en una tarea posterior con QA. No se activaron Transbank, Tally productivo, Zoom ni correos.
