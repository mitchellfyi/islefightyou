import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Isle Fight You - Paradise Punches Back',
  description: 'A browser‑based island builder with guns, coconuts, and enough PvP to ruin even the sunniest holiday. Mobile-first survival and raiding game.',
  keywords: 'game, multiplayer, survival, island, pvp, browser game, raiding, guns, combat',
  authors: [{ name: 'Isle Fight You Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/assets/icons/isle_fight_you_icon_16_transparent.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/icons/isle_fight_you_icon_32_transparent.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/icons/isle_fight_you_icon_48_transparent.png', sizes: '48x48', type: 'image/png' },
      { url: '/assets/icons/isle_fight_you_icon_64_transparent.png', sizes: '64x64', type: 'image/png' },
      { url: '/assets/icons/isle_fight_you_icon_96_transparent.png', sizes: '96x96', type: 'image/png' },
      { url: '/assets/icons/isle_fight_you_icon_128_transparent.png', sizes: '128x128', type: 'image/png' },
      { url: '/assets/icons/isle_fight_you_icon_256_transparent.png', sizes: '256x256', type: 'image/png' },
      { url: '/assets/icons/isle_fight_you_icon_512_transparent.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/assets/icons/isle_fight_you_icon_180_transparent.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} h-full overflow-hidden bg-gray-900`}>
        {children}
      </body>
    </html>
  )
} 