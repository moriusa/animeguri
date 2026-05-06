// マーカー管理のカスタムフック
import { useEffect, useRef, RefObject } from "react";
import mapboxgl from "mapbox-gl";
import { Report } from "@/types/api/article";
import { createMarkerElement } from "./createMarkerElement";

interface MarkerData {
  marker: mapboxgl.Marker;
  element: HTMLElement;
}

interface UseMapMarkersProps {
  map: RefObject<mapboxgl.Map | null>;
  isMapReady: boolean;
  reports: Report[];
  onMarkerClick?: (report: Report) => void;
  selectedReportId?: string;
}

export const useMapMarkers = ({
  map,
  isMapReady,
  reports,
  onMarkerClick,
  selectedReportId,
}: UseMapMarkersProps) => {
  const markersRef = useRef<Map<string, MarkerData>>(new Map());
  const clickPopupRef = useRef<mapboxgl.Popup | null>(null);
  const hoverPopupRef = useRef<mapboxgl.Popup | null>(null);

  // マーカーの配置・更新
  useEffect(() => {
    if (!isMapReady || !map.current) {
      console.log("⏳ skip:", { isMapReady, hasMap: !!map.current });
      return;
    }

    // ★ map が有効か確認
    try {
      map.current.getCanvas();
    } catch {
      console.log("❌ map is destroyed");
      return;
    }

    if (reports.length === 0) {
      console.log("⏳ reports is empty, skip");
      return; // ★ 空配列の時はマーカー削除しない（ロード中の可能性）
    }

    console.log("✅ adding markers:", reports.length);

    const currentIds = new Set(markersRef.current.keys());
    const newIds = new Set<string>();

    reports.forEach((report) => {
      if (!report.latitude || !report.longitude) return;

      newIds.add(report.id);
      if (markersRef.current.has(report.id)) return;

      const el = createMarkerElement(report);
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([report.longitude, report.latitude])
        .addTo(map.current!);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        hoverPopupRef.current?.remove();
        clickPopupRef.current?.remove();

        clickPopupRef.current = new mapboxgl.Popup({
          offset: [20, 0],
          anchor: "left",
          closeButton: true,
          maxWidth: "320px",
        })
          .setLngLat([report.longitude!, report.latitude!])
          .setHTML(createDetailHTML(report))
          .addTo(map.current!);

        onMarkerClick?.(report);
      });

      let hoverTimeout: NodeJS.Timeout;
      el.addEventListener("mouseenter", () => {
        hoverTimeout = setTimeout(() => {
          if (clickPopupRef.current?.isOpen()) return;
          hoverPopupRef.current?.remove();
          hoverPopupRef.current = new mapboxgl.Popup({
            offset: [20, 0],
            anchor: "left",
            closeButton: false,
            closeOnClick: false,
          })
            .setLngLat([report.longitude!, report.latitude!])
            .setHTML(createHoverHTML(report))
            .addTo(map.current!);
        }, 300);
      });

      el.addEventListener("mouseleave", () => {
        clearTimeout(hoverTimeout);
        hoverPopupRef.current?.remove();
      });

      markersRef.current.set(report.id, { marker, element: el });
    });

    // 不要なマーカーだけ削除
    currentIds.forEach((id) => {
      if (!newIds.has(id)) {
        markersRef.current.get(id)?.marker.remove();
        markersRef.current.delete(id);
      }
    });

    // ★ cleanup ではマーカーを消さない
  }, [reports, onMarkerClick, isMapReady]);

  // ★ isMapReady が false になった時だけ全クリア（mapが破棄された時）
  useEffect(() => {
    if (!isMapReady) {
      console.log("🗑️ map destroyed, clearing markers");
      markersRef.current.forEach(({ marker }) => {
        try {
          marker.remove();
        } catch {
          /* 無視 */
        }
      });
      markersRef.current.clear();
      clickPopupRef.current = null;
      hoverPopupRef.current = null;
    }
  }, [isMapReady]);

  // 選択状態の更新
  useEffect(() => {
    markersRef.current.forEach(({ element }, id) => {
      const inner = element.querySelector(
        ".custom-marker-inner",
      ) as HTMLElement;
      if (!inner) return;

      const isSelected = id === selectedReportId;
      element.classList.toggle("selected", isSelected);
      inner.style.borderColor = isSelected ? "#3b82f6" : "white";
      inner.style.borderWidth = isSelected ? "4px" : "3px";
      inner.style.transform = isSelected ? "scale(1.15)" : "scale(1)";
      inner.style.boxShadow = isSelected
        ? "0 4px 16px rgba(59,130,246,0.6)"
        : "0 2px 8px rgba(0,0,0,0.3)";
    });
  }, [selectedReportId]);
};

// ホバー時の簡易表示
const createHoverHTML = (report: Report): string => `
  <div style="padding: 8px;">
    <h3 style="margin: 0 0 4px; font-size: 14px; font-weight: bold;">
      ${report.title}
    </h3>
    <p style="margin: 0; font-size: 12px; color: #666;">
      ${`${report.prefecture} ${report.city} ${report.streetAddress} ${report.spotName}` || "住所不明"}
    </p>
  </div>
`;

const locationIcon = `
  <svg xmlns="http://www.w3.org/2000/svg"
    width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2"
    style="display:inline; vertical-align:middle; margin-right:4px; color:red;">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
`;

// クリック時の詳細表示
const createDetailHTML = (report: Report): string => `
  <div style="padding:8px;">
    <div style="padding:6px 0;">
      <h2 style="font-size:16px; font-weight:bold; margin:8px 0">
        ${report.title}
      </h2>
      <div style="font-size:13px; color:#666; display:flex; align-items:center;">
        ${locationIcon}
        <p>${`${report.prefecture} ${report.city} ${report.streetAddress} ${report.spotName}` || "住所不明"}</p>
      </div>
    </div>
    ${
      report.reportImages?.[0]
        ? `<img
            src="${report.reportImages[0].imageUrl}"
            alt="${report.title}"
            style="width:100%; height:180px; object-fit:cover; border-radius:8px; margin-top:8px;"
          />`
        : ""
    }
    <a
      href="/article/${report.articleId}"
      style="display:block; text-align:center; background:#481c00; color:white; padding:8px; border-radius:8px; text-decoration:none; margin-top:8px;"
    >
      詳細を見る
    </a>
  </div>
`;
