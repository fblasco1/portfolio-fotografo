import AdminNav from '../components/AdminNav'

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="container mx-auto px-4 py-4">
        <AdminNav />
      </div>
      <main className="min-h-0 flex-1">{children}</main>
    </div>
  )
}
