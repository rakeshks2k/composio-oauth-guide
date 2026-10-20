import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Composio Platform — OAuth Guides',
  description: 'Production OAuth integration guides for connecting apps to Composio. Managed vs. custom OAuth, scopes, verification, and agent capabilities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#0f0f0f] text-[#ffffff] min-h-screen antialiased selection:bg-[#51a2ff]/20 selection:text-[#51a2ff]`}>
        {children}
      </body>
    </html>
  );
}
