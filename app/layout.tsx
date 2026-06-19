import type { Metadata } from 'next'
import { Barlow_Condensed, DM_Sans } from 'next/font/google'

import './globals.css'
import { SiteHeader } from '@/components/SiteHeader'
import { Footer } from '@/components/Footer'

const display = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const sans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BAZOOKA — Studio-Grade Sneaker Care',
  description:
    'Clean. Protect. Refresh. A precision sneaker care system built for rotation, not routine.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen overflow-x-hidden bg-night font-sans">
        <SiteHeader />
        {children}
        <Footer />
      </body>
    </html>
  )
}
