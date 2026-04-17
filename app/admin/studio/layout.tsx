import AdminNav from '../components/AdminNav'
import './studio-shell.css'

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-studio-root flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="sticky top-0 z-50 flex-shrink-0 border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto px-4 py-2">
          <AdminNav />
        </div>
      </div>
      <main className="relative min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full min-h-0 flex-col">{children}</div>
      </main>
    </div>
  )
}
