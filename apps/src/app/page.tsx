import HomeArticles from "@/components/HomeArticles";
import { MapView } from "@/components/map/MapView";
import { getReports } from "@/features/articles/hooks/getReports";
import { Suspense } from "react";
export const dynamic = "force-dynamic";


export default async function Home() {
  const reports = await getReports();
  return (
    <main className="">
      <MapView initialReports={reports}/>
      <div className="space-y-16 mt-16 max-w-4xl mx-auto">
        <Suspense fallback={<p>読み込み中...</p>}>
          <HomeArticles type="latestArticles" />
        </Suspense>
      </div>
    </main>
  );
}
