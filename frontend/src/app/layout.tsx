import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Period Care - Tu Compañera de Bienestar Menstrual',
  description: 'Plataforma empática de cuidado menstrual con IA personalizada',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
