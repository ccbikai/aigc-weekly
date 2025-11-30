import type { Metadata, Viewport } from 'next'
import React from 'react'
import { ThemeProvider } from '@/components/theme/ThemeProvider'

import { ThemeScript } from '@/components/theme/ThemeScript'
import { siteConfig } from '@/lib/config'
import './global.css'

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  openGraph: siteConfig.openGraph,
  twitter: siteConfig.twitter,
  icons: siteConfig.icons,
  metadataBase: siteConfig.metadataBase,
  alternates: siteConfig.alternates,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="zh-Hans" suppressHydrationWarning>
      <body>
        <ThemeScript />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
