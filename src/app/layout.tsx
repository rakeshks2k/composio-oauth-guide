import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OAuth Guide Generator — Composio',
  description: 'AI-powered OAuth integration guides for connecting apps to Composio. Covers managed OAuth vs custom OAuth, setup steps, scopes, and approval requirements.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-bg-primary text-text-primary min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
