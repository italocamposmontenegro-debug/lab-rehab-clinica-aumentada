# Laboratorio de Rehabilitación Clínica Aumentada

Sitio web profesional del **Laboratorio de Rehabilitación Clínica Aumentada** — Ítalo Campos Montenegro.

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
# → http://localhost:4321/

# Validar tipos y estructura Astro
npm run lint

# Build de producción
npm run build

# Preview del build
npm run preview
```

## Stack

- **Astro** — Generador de sitios estáticos
- **Tailwind CSS** — Utilidades CSS
- **Google Fonts** — Playfair Display (títulos) + Inter (cuerpo)
- **GitHub Pages** — Hosting con dominio personalizado `italocampos.cl`

## Estructura

```
src/
├── layouts/Layout.astro    # Shell HTML (SEO, fonts, meta)
├── pages/index.astro       # Página principal (single-page)
public/
├── images/italo-profile.jpg
├── favicon.svg
```

## Despliegue

El sitio se despliega automáticamente a GitHub Pages con cada push a `main` mediante GitHub Actions (`.github/workflows/deploy.yml`) y se publica en `https://italocampos.cl/`.

## Actualizar contenido

Todo el contenido se encuentra en `src/pages/index.astro`. Las secciones están claramente separadas con comentarios. Para actualizar:

1. Editar la sección correspondiente en `index.astro`
2. Hacer commit y push a `main`
3. GitHub Actions reconstruirá y desplegará automáticamente
