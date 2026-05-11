import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ContractFlow',
  description: 'Gestão de contratos e pagamentos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
