import HomeArticles from "@/components/HomeArticles";
import HomeMap from "@/components/map/HomeMap";
import { getReports } from "@/features/articles/hooks/getReports";
import { Suspense } from "react";
export const dynamic = "force-dynamic";

export default async function Home() {
  const reports = await getReports();

  return (
    <main className="">
      {/* 地図 */}
      <HomeMap initialReports={reports}/>
      {/* 記事一覧 */}
      <div className="space-y-16 mt-16 max-w-4xl mx-auto">
        <Suspense fallback={<p>読み込み中...</p>}>
          <HomeArticles type="latestArticles" />
        </Suspense>
      </div>
    </main>
  );
}
