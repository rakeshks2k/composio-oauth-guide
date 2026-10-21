import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Composio Platform refined design tokens
        composio: {
          canvas: '#0a0a0a',
          surface: '#111111',
          card: '#161616',
          elevated: '#1a1a1a',
          hover: '#1e1e1e',
          border: '#242424',
          borderSubtle: '#1c1c1c',
          borderFocus: '#383838',
          text: '#ededed',
          textMuted: '#888888',
          textDim: '#555555',
          brand: '#51a2ff',
          brandHover: '#3d8be6',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-geist-sans)',
          '"Geist Sans"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'var(--font-jetbrains)',
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
