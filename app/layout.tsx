import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JVA Designs - Award-Winning Architecture Firm',
  description: 'Award-winning architecture firm specializing in modern, sustainable design. Explore our portfolio of residential, commercial, and institutional projects.',
  keywords: ['architecture', 'design', 'JVA Designs', 'modern architecture', 'sustainable design'],
  authors: [{ name: 'JVA Designs' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jvadesigns.com',
    siteName: 'JVA Designs',
    title: 'JVA Designs - Award-Winning Architecture Firm',
    description: 'Award-winning architecture firm specializing in modern, sustainable design.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'JVA Designs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JVA Designs - Award-Winning Architecture Firm',
    description: 'Award-winning architecture firm specializing in modern, sustainable design.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#bbd922" />
      </head>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
