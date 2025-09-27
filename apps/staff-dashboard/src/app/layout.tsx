import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';

import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';
import { ReshapedProvider } from '@/components/providers/reshaped-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LIMI Staff Ops Dashboard',
  description:
    'Operational command center for staff, powered by Supabase realtime data and AI insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-rs-theme="slate" data-rs-color-mode="auto">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ReshapedProvider>
            <QueryProvider>{children}</QueryProvider>
          </ReshapedProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
