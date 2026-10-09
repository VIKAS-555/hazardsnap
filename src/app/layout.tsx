import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HazardSnap | Hyper-Local Photo-First Civic Safety Map',
  description:
    'Log hazards in 5 seconds with photo, location pin, or voice note. Real-time safety map for commuters and severity-ranked triage queue for municipal teams with photographic fix verification.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
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
        <link rel="preconnect" href="https://tile.openstreetmap.org" crossOrigin="" />
        <link rel="dns-prefetch" href="https://tile.openstreetmap.org" />
        <link rel="preconnect" href="https://server.arcgisonline.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://server.arcgisonline.com" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="bg-zinc-950 text-white min-h-screen antialiased selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
