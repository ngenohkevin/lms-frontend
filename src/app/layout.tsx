import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Library Management System',
  description:
    'Premium school library management system with modern macOS-inspired design',
  keywords: ['library', 'management', 'books', 'students', 'education'],
  authors: [{ name: 'LMS Team' }],
  creator: 'LMS Team',
  metadataBase: new URL('https://lms.example.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lms.example.com',
    siteName: 'Library Management System',
    title: 'Library Management System',
    description: 'Premium school library management system with modern design',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Library Management System',
    description: 'Premium school library management system with modern design',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${inter.className} bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
