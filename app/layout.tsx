import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { SupabaseAuthProvider } from '@/lib/supabase-auth-context'
import { InvoiceProvider } from '@/lib/invoice-context'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'InvoiceFlow — Invoice Processing, Simplified',
  description: 'Fast, secure, and transparent invoice processing with real-time tracking. Process invoices in under 24 hours.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SupabaseAuthProvider>
            <InvoiceProvider>
              {children}
              {process.env.NODE_ENV === 'production' && <Analytics />}
            </InvoiceProvider>
          </SupabaseAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
