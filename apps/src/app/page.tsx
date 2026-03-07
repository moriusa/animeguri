"use client";

import HomeArticles from "@/components/HomeArticles";
import { MAP_STYLES } from "@/components/map/mapStyles";
import { MapView } from "@/components/map/MapView";
import { useGetAllReports } from "@/features/articles/useGetAllReports";
import { Report } from "@/types/api/article";
import { useCallback, useState, useMemo } from "react"; // useMemo 追加

export default function Home() {
  const { reports, loading, error } = useGetAllReports();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // useCallback でメモ化
  const handleMarkerClick = useCallback((report: Report) => {
    console.log("🎯 記事が選択されました:", report.title);
    setSelectedReport(report);
  }, []);

  // reports.data をメモ化（参照が変わらないようにする）
  const reportData = useMemo(() => reports?.data || [], [reports?.data]);

  return (
    <main className="">

      {/* 地図 */}
      <div className="h-[65vh] overflow-hidden relative">
        {/* ローディング表示 */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
              <p className="text-gray-600">MAP記事を読み込み中...</p>
            </div>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg">
              error {error}
            </div>
          </div>
        )}
        <MapView
          mapStyle={MAP_STYLES.streets}
          reports={reportData} // メモ化されたデータ
          onMarkerClick={handleMarkerClick}
          selectedReportId={selectedReport?.id} // 選択状態を渡す
        />

        <div className="absolute top-2 left-2 max-w-xs">
          <div className="bg-white rounded-lg shadow-lg p-3">
            {reportData.length > 0 && (
              <p className="text-xs text-gray-500">
                {reportData.length}件の聖地が登録されています
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 記事一覧 */}
      <div className="space-y-16 mt-16 max-w-4xl mx-auto">
        <HomeArticles type="latestArticles" />
      </div>
    </main>
  );
}