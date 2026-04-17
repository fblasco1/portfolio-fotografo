import AdminNav from '../components/AdminNav'

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="sticky top-0 z-50 flex-shrink-0 border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto px-4 py-4">
          <AdminNav />
        </div>
      </div>
      <main className="relative flex-1 min-h-0 overflow-hidden">
        <div className="h-full">{children}</div>
      </main>
    </div>
  )
}
