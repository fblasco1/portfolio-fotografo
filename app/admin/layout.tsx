export const metadata = {
  title: 'Cristian Pirovano - Admin Studio',
  description: 'Panel de administración para el portfolio fotográfico de Cristian Pirovano',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
