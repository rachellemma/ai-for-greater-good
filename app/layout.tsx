import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import { SiteHeader } from '@/components/site-header'
import './globals.css'

const _plexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })
const _plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'] })

export const metadata: Metadata = {
  title: 'Mlangizi — Grounded farm advice over SMS, voice & photo',
  description:
    'Open-source agentic advisory platform delivering locally-grounded, expert-validated farming guidance to smallholder farmers over SMS, voice calls and photos. No internet or smartphone required.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#2f5a3c',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased">
        <SiteHeader />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
