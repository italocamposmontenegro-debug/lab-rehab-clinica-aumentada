import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
    integrations: [tailwind()],
    site: 'https://italocamposmontenegro-debug.github.io',
    base: '/lab-rehab-clinica-aumentada',
});
