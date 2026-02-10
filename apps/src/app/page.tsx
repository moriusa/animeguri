"use client";

import HomeArticles from "@/components/HomeArticles";
import { MAP_STYLES } from "@/components/map/mapStyles";
import { MapView } from "@/components/map/MapView";
import { useGetAllReports } from "@/features/articles/useGetAllReports";
import { Report } from "@/types/api/article";
import Image from "next/image";
import { useCallback, useState, useMemo } from "react"; // ✅ useMemo 追加

export default function Home() {
  const { reports, loading, error } = useGetAllReports();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // ✅ useCallback でメモ化
  const handleMarkerClick = useCallback((report: Report) => {
    console.log("🎯 記事が選択されました:", report.title);
    setSelectedReport(report);
  }, []);

  // ✅ reports.data をメモ化（参照が変わらないようにする）
  const reportData = useMemo(() => reports?.data || [], [reports?.data]);

  return (
    <main className="flex-1 relative">
      {/* ローディング表示 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">記事を読み込み中...</p>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg">
            ❌ {error}
          </div>
        </div>
      )}

      {/* 地図 */}
      <div className="h-96 rounded-lg overflow-hidden border relative">
        <MapView
          mapStyle={MAP_STYLES.streets}
          reports={reportData} // ✅ メモ化されたデータ
          onMarkerClick={handleMarkerClick}
          selectedReportId={selectedReport?.id} // ✅ 選択状態を渡す
        />

        {/* 左上: 説明 */}
        <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 max-w-xs">
          <div className="bg-white rounded-lg shadow-lg p-3 md:p-4">
            <p className="text-xs md:text-sm text-gray-600">
              📍 地図上のピンをクリックして聖地情報を見よう
            </p>
            {reportData.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {reportData.length}件の聖地が登録されています
              </p>
            )}
          </div>
        </div>

        {/* 選択された記事の詳細 */}
        {selectedReport && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-10">
            <div className="bg-white rounded-lg shadow-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-bold">{selectedReport.title}</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                  aria-label="閉じる"
                >
                  ✕
                </button>
              </div>

              {selectedReport.reportImages?.[0] && (
                <div className="relative w-full h-48 mb-3">
                  <Image
                    src={selectedReport.reportImages[0].imageUrl}
                    alt={selectedReport.title}
                    fill
                    className="object-cover rounded-lg mb-3"
                  />
                </div>
              )}

              <p className="text-sm text-gray-600 mb-2">
                📍 {selectedReport.geocodedAddress || "住所不明"}
              </p>

              <a
                href={`/articles/${selectedReport.articleId}`}
                className="block w-full bg-blue-500 text-white text-center py-2 rounded-lg hover:bg-blue-600 transition"
              >
                詳細を見る
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 記事一覧 */}
      <div className="space-y-16 mt-16">
        <HomeArticles type="latestArticles" />
      </div>
    </main>
  );
}