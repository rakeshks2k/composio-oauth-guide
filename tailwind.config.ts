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
        // Composio Platform official design system tokens
        composio: {
          bg: '#0f0f0f',
          surface: '#141414',
          raised: '#1a1a1a',
          card: '#1e1e1e',
          popover: '#2a2a2a',
          border: '#2c2c2c',
          borderLight: '#383838',
          text: '#ffffff',
          secondary: '#a0a0a0',
          muted: '#737373',
          accent: '#51a2ff',
          accentDark: '#0e2439',
          badgeBg: '#0d2636',
          badgeBorder: '#1a5676',
        },
        // Keep existing token mappings for backwards compatibility
        bg: {
          primary: '#0f0f0f',
          secondary: '#141414',
          border: '#2c2c2c',
          card: '#1e1e1e',
          raised: '#1a1a1a',
        },
        accent: {
          teal: '#51a2ff',
          blue: '#51a2ff',
          amber: '#f59e0b',
          red: '#ef4444',
          green: '#10b981',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a0a0a0',
          muted: '#737373',
        },
      },
      fontFamily: {
        sans: [
          '"abcDiatype"',
          'var(--font-inter)',
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