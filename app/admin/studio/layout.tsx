import AdminNav from '../components/AdminNav'

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="sticky top-0 z-50 flex-shrink-0 border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto px-4 py-4">
          <AdminNav />
        </div>
      </div>
      <main className="min-h-0 flex-1 relative">{children}</main>
    </div>
  )
}
