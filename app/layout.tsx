import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QuickStitch Delhi — Boutique Tailoring at Your Doorstep',
  description: '30-minute fabric pickup. 48-hour perfect-fit delivery. Premium custom tailoring & alterations in Dwarka, Delhi.',
  keywords: 'tailoring, stitching, doorstep tailor, dwarka, delhi, custom fitting, alterations',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'QuickStitch', statusBarStyle: 'black-translucent' },
}

export const viewport: Viewport = { themeColor: '#0F2C24' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#060d0a] text-white">
        {children}
      </body>
    </html>
  )
}
