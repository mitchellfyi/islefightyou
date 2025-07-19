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
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className={`${inter.className} h-full overflow-hidden bg-gray-900`}>
        {children}
      </body>
    </html>
  )
} 