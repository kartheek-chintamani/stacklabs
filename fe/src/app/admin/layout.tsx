export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">DevTools Nexus Admin</h1>
            <div className="flex gap-4 text-sm">
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="/admin/topics" className="text-blue-600 font-medium">Topics</a>
              <a href="/admin/articles" className="text-gray-600 hover:text-gray-900">Articles</a>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
