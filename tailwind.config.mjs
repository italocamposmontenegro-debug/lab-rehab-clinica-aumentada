/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                gold: {
                    50: '#faf6eb',
                    100: '#f3ebd0',
                    200: '#e6d6a3',
                    300: '#d4ba6a',
                    400: '#c5a344',
                    500: '#b8923a',
                    600: '#9a7430',
                    700: '#7a5729',
                    800: '#674928',
                    900: '#593e27',
                    950: '#342013',
                },
            },
            fontFamily: {
                serif: ['Playfair Display', 'Georgia', 'serif'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
