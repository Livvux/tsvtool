import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // TSV Strassenpfoten branding colors
        accent: '#09202C',
        primary: '#5C82A1',
        background: '#FFFFFF',
        textPrimary: '#4A4E57',
        inputBorder: '#CCCCCC',
      },
      fontFamily: {
        sans: [
          'HelveticaNowText',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Oxygen-Sans"',
          'Ubuntu',
          'Cantarell',
          '"Helvetica Neue"',
          'sans-serif',
        ],
      },
      borderRadius: {
        DEFAULT: '6px',
      },
    },
  },
  plugins: [],
};

export default config;

