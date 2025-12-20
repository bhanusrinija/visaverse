/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Light Lavender - Calm and professional
                primary: {
                    50: '#faf8ff',
                    100: '#f4f0fe',
                    200: '#e9e2fd',
                    300: '#d6c6fb',
                    400: '#b89df7',
                    500: '#9b75f1',
                    600: '#7e4ee6',
                    700: '#6838c7',
                    800: '#5630a3',
                    900: '#472985',
                    950: '#2d1a5a',
                },
                // Soft Peach - Warm and inviting
                accent: {
                    50: '#fff8f5',
                    100: '#fff0e8',
                    200: '#ffdfc9',
                    300: '#ffc49f',
                    400: '#ff9d66',
                    500: '#ff7a3d',
                    600: '#f85d1f',
                    700: '#e04516',
                    800: '#b83716',
                    900: '#96311a',
                    950: '#51160b',
                },
                // Mint Green - Fresh and positive
                success: {
                    50: '#f2fcf8',
                    100: '#d4f7e8',
                    200: '#aaefd5',
                    300: '#70e0bb',
                    400: '#3dcba0',
                    500: '#1aaf85',
                    600: '#0f8f6d',
                    700: '#0d7259',
                    800: '#0d5b48',
                    900: '#0c4b3c',
                    950: '#062a23',
                },
                // Soft Gold - Warm highlights
                warning: {
                    50: '#fefaec',
                    100: '#fbf0ca',
                    200: '#f8e090',
                    300: '#f4c956',
                    400: '#f1b530',
                    500: '#ea951a',
                    600: '#cf7114',
                    700: '#ab5014',
                    800: '#8c3e18',
                    900: '#743417',
                    950: '#431b09',
                },
                // Coral Pink - Gentle alerts
                danger: {
                    50: '#fef6f5',
                    100: '#fdeae8',
                    200: '#fbdad6',
                    300: '#f7beb7',
                    400: '#f1958b',
                    500: '#e76d60',
                    600: '#d24d3e',
                    700: '#b03d31',
                    800: '#92362c',
                    900: '#7a332a',
                    950: '#421712',
                },
                // Sky Blue - Info and accents
                info: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#b9e6fe',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
