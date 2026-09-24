# RA01 · checklist ejecutable de migración de dominio

> **Cierre del 23-09-2026:** el corte productivo se completó. Las casillas siguientes registran el estado **previo** a la ejecución y no deben leerse como trabajo aún pendiente. La verificación final, los respaldos, el diferencial DNS y los límites del rollback están en [CUTOVER_CLOUDFLARE_RA01.md](CUTOVER_CLOUDFLARE_RA01.md). GitHub Pages se conserva por al menos 48 horas; su retirada es una decisión posterior.

**Estado al 23-09-2026:** inventario autenticado y Pages preview por carga directa; DNS y producción intactos. RA01 está en `ra01-lab-preview.pages.dev`, todavía 404 intencional en `italocampos.cl`. `[x]` indica comprobación efectivamente realizada; `[ ]` indica pendiente. Detalle: [DOMINIO_INFRA_RA01.md](DOMINIO_INFRA_RA01.md) y [CLOUDFLARE_PREVIEW_RA01.md](CLOUDFLARE_PREVIEW_RA01.md).

## A. Inventario y respaldo, antes de tocar producción

- [x] WHOIS NIC Chile comprobado: dominio registrado, vencimiento y NS públicos.
- [x] Respuestas DNS públicas y HTTP/TLS actuales registradas.
- [ ] Exportación completa de zona Cloudflare guardada **fuera del repositorio**: hostname, tipo, destino, proxy y TTL de todos los registros.
- [x] Copia manual privada de los 17 registros y valores de rollback, ignorada por Git; falta exportación BIND nativa.
- [ ] Reglas Cloudflare, modo SSL/TLS, Always Use HTTPS, HSTS, DNSSEC y custom domains inventariados.
- [x] Configuración web original de apex y `www` registrada con valores de origen, no IP públicas de borde.
- [x] Zona revisada: sin MX, SPF, DKIM, DMARC ni TXT de verificación; correo externo preservado. Email Routing de cuenta pendiente.
- [ ] Operadores y destinos de `handmov`, `test-salival` y `rehapp` confirmados; sus registros excluidos del corte.
- [x] Repositorio, rama principal, workflow de GitHub Pages, dominio y HTTPS identificados.
- [x] Build local reproducible (`npm test`, 17 páginas) y RA01 verificado (`npm run test:ra01`).
- [x] Build revisado para ausencia de `ops/ra01/private`, identificadores privados de Sheets/Drive, ZIP, `.env` y source maps.
- [x] Baseline público de home registrado para móvil y desktop en `output/infra-ra01/baseline.json`.

## B. Preparación del destino sin modificar el dominio

- [ ] RA01 consolidado en commit/revisión publicable; mantener modo preview y pagos desactivados.
- [x] `404.html` explícito y probado en Pages; navegación Formación enlaza directamente a `/formacion/ra01`.
- [ ] Proyecto Cloudflare Pages Free creado con GitHub; production branch `main`, build `npm run build`, output `dist`, Node 20.
- [x] Proyecto Pages Free creado mediante Direct Upload, sin Git, custom domain ni variables.
- [x] Preview temporal `https://ra01-lab-preview.pages.dev/` obtenido y URL registrada.
- [ ] Preview: home, investigación, sistemas, videos, enlaces externos, anchors y SEO comprobados por completo. Navegación y secciones principales sí observadas.
- [x] Preview: RA01 landing, tres demos, pago simulado, ayuda, preparación, lista de espera, condiciones y siete políticas abren con contenido correcto.
- [ ] Preview: alias `/formacion/RA01` y `/formación/RA01`, slash final, 404 y recursos probados.
- [x] Alias `/formacion/RA01` y `/formación/RA01` convergen a RA01; slash final y 404 explícito probados. Falta barrido completo de recursos.
- [ ] Preview: consola, móvil/desktop, accesibilidad, rendimiento, certificado, `X-Robots-Tag: noindex`, robots/sitemap y ausencia de secretos comprobados.
- [ ] QA de preview aprobado y evidencia guardada.
- [x] Preview: hero, metodología, Kit y formulario→pago simulado interactúan; consola sin errores observados; build/ZIP sin archivos privados.
- [ ] Repetir build Linux/Git: primera carga Windows generó `RA01` mayúscula y 404; segunda carga corrigió sólo artefacto `dist` con ruta minúscula.
- [ ] Servicios externos y futura CSP revisados: Tally, Sheets/Drive, Transbank, Zoom, Gmail y analítica.

## C. Cambio controlado, sólo después de B

- [ ] Export DNS y configuración de rollback verificadas inmediatamente antes del corte.
- [ ] Ventana de corte y responsables acordados.
- [ ] Dominio personalizado `italocampos.cl` preparado en Pages; cualquier cambio DNS automático identificado **antes de confirmarlo**.
- [ ] Únicamente el registro web apex necesario cambiado/asociado; NS, DS, MX, TXT y subdominios sin modificaciones.
- [ ] Certificado Pages válido y HTTPS funcional.
- [ ] `www` 301→apex y HTTP→HTTPS comprobados sin bucles.
- [ ] Sitio profesional, enlaces científicos y sistemas comprobados.
- [ ] RA01 y todos sus recursos/rutas comprobados, sin activar aún cobros si sus gates siguen cerrados.
- [ ] Canonical, metadatos, JSON-LD, sitemap, robots, imágenes y URLs actuales comprobados.
- [ ] Rendimiento móvil/desktop repetido con el mismo protocolo y contrastado con baseline.
- [ ] Rollback a GitHub Pages **ensayado o validado operativamente** y documentado.
- [ ] Periodo de estabilidad cumplido y redirect `www` independizado de GitHub Pages.
- [ ] GitHub Pages retirado sólo después de todo lo anterior; GitHub permanece como repositorio.

**Regla de parada:** si aparece un secreto en una URL pública, detener el despliegue y tratarlo como P0. Si falla certificado, redirección, home o servicios críticos durante el corte, ejecutar el rollback documentado en `DOMINIO_INFRA_RA01.md`; no tocar correo ni nameservers.
