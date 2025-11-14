import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ConvexClientProvider } from './ConvexClientProvider';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';

export const metadata: Metadata = {
  title: {
    default: 'TSV Strassenpfoten e.V. 🐾 Hunde & Katzen adoptieren',
    template: '%s | TSV Strassenpfoten e.V.',
  },
  description: 'Möchtest du Hunde oder Katzen adoptieren? 🐶🐱 TSV Strassenpfoten e.V. bietet liebevolle Tiere ein Zuhause. Finde deinen neuen tierischen Begleiter! ❤️',
  keywords: ['Hunde adoptieren', 'Katzen adoptieren', 'Tierheim', 'TSV Strassenpfoten', 'Tiervermittlung'],
  authors: [{ name: 'TSV Strassenpfoten e.V.' }],
  creator: 'TSV Strassenpfoten e.V.',
  publisher: 'TSV Strassenpfoten e.V.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tsvstrassenpfoten.de'),
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: '/',
    title: 'TSV Strassenpfoten e.V. 🐾 Hunde & Katzen adoptieren',
    description: 'Möchtest du Hunde oder Katzen adoptieren? 🐶🐱 TSV Strassenpfoten e.V. bietet liebevolle Tiere ein Zuhause. Finde deinen neuen tierischen Begleiter! ❤️',
    siteName: 'TSV Strassenpfoten e.V.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TSV Strassenpfoten e.V. 🐾 Hunde & Katzen adoptieren',
    description: 'Möchtest du Hunde oder Katzen adoptieren? 🐶🐱 TSV Strassenpfoten e.V. bietet liebevolle Tiere ein Zuhause.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

