import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Sentinel AI | ETH DEX Dashboard',
  description: 'AI-powered Uniswap liquidity and DEX data aggregator.',
  other: {
    'fc:miniapp': JSON.stringify({
      version: 'next',
      imageUrl: '/hero-image.png',
      button: {
        title: 'Launch Sentinel AI',
        action: {
          type: 'launch_miniapp',
          name: 'Sentinel AI',
          url: process.env.APP_URL || 'https://sentinel-ai.vercel.app',
          splashImageUrl: '/splash-image.png',
          splashBackgroundColor: '#050507',
        },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="bg-brand-bg text-brand-text min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
