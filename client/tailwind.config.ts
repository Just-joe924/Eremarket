import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* --- EreMarket brand --------------------------------------------
           Deep teal carries structure (header, footer, banners, sidebar);
           vibrant orange is reserved for the primary action on a screen.
           `primary` is aliased to the teal so the utilities already spread
           across the app inherit the new palette without being rewritten. */
        'brand-teal': '#1f5257',
        'brand-orange': '#faa327',

        primary: '#1f5257',
        'primary-dark': '#153c40',
        'primary-soft': '#e7efef',
        'primary-border': '#d2e0e0',

        cta: '#faa327',
        'cta-hover': '#e8900f',
        'cta-soft': '#fef4e6',
        'cta-ink': '#8a5405', // orange dark enough to read as text on white

        surface: '#ffffff',
        'surface-2': '#f7f8f8',

        header: '#f7f8f8', // light rules and table borders
        ink: '#1b2426',
        muted: '#4a5c5e',
        'muted-2': '#6c7b7d',
        accent: '#d23b2f', // destructive / error only
        'accent-2': '#e2614f',
        star: '#faa327',
      },
      fontFamily: {
        sans: ['"League Spartan"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
