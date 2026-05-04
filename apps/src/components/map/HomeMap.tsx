"use client";

import { useCallback, useState } from "react";
import { MapView } from "@/components/map/MapView";
import { MAP_STYLES } from "@/components/map/mapStyles";
import { Report } from "@/types/api/article";

type Props = {
  initialReports: Report[];
};

export default function HomeMap({ initialReports }: Props) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const handleMarkerClick = useCallback((report: Report) => {
    setSelectedReport(report);
  }, []);

  return (
    <div className="h-[65vh] overflow-hidden relative">
      <MapView
        mapStyle={MAP_STYLES.streets}
        reports={initialReports} // メモ化されたデータ
        onMarkerClick={handleMarkerClick}
        selectedReportId={selectedReport?.id} // 選択状態を渡す
      />

      <div className="absolute top-2 left-2 max-w-xs">
        <div className="bg-white rounded-lg shadow-lg p-3">
          {initialReports.length > 0 && (
            <p className="text-xs text-gray-500">
              {initialReports.length}件の聖地が登録されています
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
