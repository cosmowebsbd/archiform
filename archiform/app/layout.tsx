import type { Metadata } from 'next'
import './globals.css'
import ApolloClientProvider from '@/components/providers/ApolloProvider'

export const metadata: Metadata = {
  title: {
    default: 'Archiform – Project Management for A&E Firms',
    template: '%s | Archiform',
  },
  description: 'The fastest project management software for Architecture & Engineering firms.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased">
        <ApolloClientProvider>
          {children}
        </ApolloClientProvider>
      </body>
    </html>
  )
}