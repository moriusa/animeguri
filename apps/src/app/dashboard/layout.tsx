import { Sidebar } from "@/components/dashboard/Sidebar";

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* サイドバー */}
      <aside className="w-64 p-8">
        <h1 className="text-3xl font-bold mb-8">記事</h1>
        <Sidebar />
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}