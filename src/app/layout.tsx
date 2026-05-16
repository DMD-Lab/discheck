import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ViewTransitions } from 'next-view-transitions'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0F0F0F' },
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'Discheck',
    template: '%s · Discheck',
  },
  description: 'Suivez vos discographies musicales. Explorez des artistes, cochez vos écoutes et suivez votre progression album par album.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Discheck',
    description: 'Suivez vos discographies musicales.',
    siteName: 'Discheck',
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-bg-primary text-text-primary antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <ViewTransitions>
            {children}
          </ViewTransitions>
        </ThemeProvider>
      </body>
    </html>
  )
}
