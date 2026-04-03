import { Navbar } from '@components/navbar'
import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { TRPCReactProvider } from '@/trpc/client'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'DevRoast',
  description: 'Paste your code. Get roasted.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={jetbrainsMono.variable}>
      <body className="min-h-screen bg-neutral-950 font-mono text-zinc-50">
        <Navbar />
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  )
}
