type Props = {
  locale: string
}

export default function Footer({ locale }: Props) {
  return (
    <footer className="bg-gray-800 text-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} Cristian Pirovano. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}