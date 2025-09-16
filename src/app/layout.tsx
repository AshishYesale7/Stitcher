
'use client';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';


function RootLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const isLandingPage = pathname === '/';

    const faviconDataUrl = `data:image/svg+xml,${encodeURIComponent(
    `
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F59E0B" />
          <stop offset="100%" stop-color="#EC4899" />
        </linearGradient>
      </defs>
       <rect width="100" height="100" rx="20" fill="black" />
      <path
        fill="url(#logo-gradient)"
        d="M63.3,38.3 C61.5,36.5 59,35.8 56.5,35.8 C51.2,35.8 47.1,40.1 47.1,45.4 C47.1,47.7 48,49.8 49.5,51.3 L49.5,51.3 C50.1,51.9 50.6,52.4 51,52.8 C52.2,54 53.1,55 53.7,55.9 C54.3,56.8 54.6,57.8 54.6,58.9 C54.6,61.9 52.1,64.2 49.2,64.2 C46.7,64.2 44.6,62.5 43.9,60.2 L36.7,60.2 C37.5,66.5 42.8,71.2 49.2,71.2 C55.7,71.2 61.6,65.9 61.6,58.9 C61.6,56.4 60.7,54.2 59.1,52.6 L59.1,52.6 C58.6,52.1 58.1,51.6 57.6,51.1 C56.6,50 55.7,49.1 55.1,48.2 C54.5,47.3 54.1,46.3 54.1,45.4 C54.1,42.5 56.3,40.8 58.5,40.8 C60.6,40.8 62.4,42.2 63,44.2 L70,44.2 C69.1,38.4 66.1,35.2 63.3,38.3 Z"
      />
    </svg>
    `
  )}`;

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <title>Fabrova</title>
                <meta name="description" content="Connecting you with the perfect tailor." />
                <link rel="icon" href={faviconDataUrl} />
                <meta httpEquiv="Permissions-Policy" content="otp-credentials=(self)" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
            </head>
            <body className={cn("font-body antialiased", isLandingPage && 'landing-page-dark')}>
                {children}
                <Toaster />
            </body>
        </html>
    );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootLayoutContent>{children}</RootLayoutContent>;
}
