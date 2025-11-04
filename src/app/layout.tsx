import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import "@/app/globals.css"
import { siteConfig } from '@/data/site-data'
import Header from '@/components/layout/header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: [
    'web development',
    'mobile development',
    'full-stack',
    'React',
    'Next.js',
    'TypeScript'
  ],
  authors: [{ name: 'Lymoun Team' }],
  creator: 'Lymoun',
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
              <Header />
        
    
      {children}

          

      </body>
    </html>
  )
}