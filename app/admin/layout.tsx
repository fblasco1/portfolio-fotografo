import { Inter } from 'next/font/google'
import '@/app/[locale]/globals.css'

export const metadata = {
  title: 'Cristian Pirovano - Admin',
  description: 'Panel de administración para el portfolio fotográfico de Cristian Pirovano',
}

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full">
      <body
        className={`${inter.className} h-full overflow-hidden bg-stone-50 text-stone-900 antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
