import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#00472c',
}

export const metadata: Metadata = {
  title: 'Clínica Mova - Agendamento de Salas',
  description: 'Sistema de agendamento de salas da Clínica Mova',
  icons: {
    icon: '/374900137_633392865443492_2609020395948165753_n.jpg',
    apple: '/374900137_633392865443492_2609020395948165753_n.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
