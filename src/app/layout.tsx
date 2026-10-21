import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const geistSans = localFont({
  src: '../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2',
  variable: '--font-geist-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Composio - OAuth Guide',
  description: 'Production OAuth integration guide for connecting apps to Composio. Managed vs. custom OAuth, scopes, verification, and agent capabilities.',
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon.png" type="image/png" sizes="128x128" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={`${geistSans.variable} ${jetbrainsMono.variable} font-sans bg-[#0a0a0a] text-[#ededed] min-h-screen antialiased selection:bg-[#51a2ff]/15 selection:text-[#ffffff]`}>
        {children}
      </body>
    </html>
  );
}
