# Ítalo Campos — sitio profesional

Hub profesional de **Ítalo Campos Montenegro**, kinesiólogo, académico e investigador. El sitio presenta su programa de investigación, los sistemas construidos desde el Laboratorio de Rehabilitación Clínica Aumentativa, su trayectoria y rutas de colaboración.

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
├── layouts/Layout.astro    # Shell HTML, metadata y estilos globales
├── pages/index.astro       # Home profesional de una sola página
├── components/             # Componentes editoriales reutilizables
public/
├── robots.txt
├── sitemap.xml
├── italo-profile.jpg       # Imagen social
├── *.mp4                   # Demostraciones de sistemas
└── favicon.svg
```

## Despliegue

El sitio se despliega automáticamente a GitHub Pages con cada push a `main` mediante GitHub Actions (`.github/workflows/deploy.yml`) y se publica en `https://italocampos.cl/`.

## Actualizar contenido

El contenido principal se encuentra en `src/pages/index.astro`. Para actualizar:

1. Editar la sección correspondiente en `index.astro`
2. Hacer commit y push a `main`
3. GitHub Actions reconstruirá y desplegará automáticamente
