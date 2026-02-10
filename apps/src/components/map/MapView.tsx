"use client";

import { useEffect, useRef, memo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAP_STYLES, type MapStyle } from "./mapStyles";
import { Report } from "@/types/api/article";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

interface MapViewProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  showControls?: boolean;
  mapStyle?: MapStyle;
  reports?: Report[];
  onMarkerClick?: (report: Report) => void;
  selectedReportId?: string; // ✅ 追加：選択中のレポートID
}

// ✅ 座標検証関数
const validateCoordinates = (lat: number, lng: number, title: string): boolean => {
  if (typeof lat !== "number" || isNaN(lat) || lat < -90 || lat > 90) {
    console.error(`❌ 無効な緯度 [${title}]: ${lat}`);
    return false;
  }
  if (typeof lng !== "number" || isNaN(lng) || lng < -180 || lng > 180) {
    console.error(`❌ 無効な経度 [${title}]: ${lng}`);
    return false;
  }
  return true;
};

const MapViewComponent = ({
  className,
  center = [139.7671, 35.6812],
  zoom = 10,
  showControls = true,
  mapStyle = MAP_STYLES.streets,
  reports = [],
  onMarkerClick,
  selectedReportId,
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  // ✅ Map で ID ベース管理（削除・更新を効率化）
  const markersRef = useRef<Map<string, { marker: mapboxgl.Marker; element: HTMLElement; report: Report }>>(
    new Map()
  );

  // ==========================================
  // 1. 地図の初期化（一度だけ実行）
  // ==========================================
  useEffect(() => {
    if (map.current) return; // ✅ 既に初期化済みならスキップ
    if (!mapContainer.current) return;

    console.log("🗺️ 地図を初期化中...");

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center,
      zoom,
      pitch: 0,
      bearing: 0,
    });

    // ==========================================
    // コントロールの追加
    // ==========================================
    if (showControls) {
      // ナビゲーションコントロール
      const navControl = new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      });
      map.current.addControl(navControl, "top-right");

      // フルスクリーンコントロール
      const fullscreenControl = new mapboxgl.FullscreenControl();
      map.current.addControl(fullscreenControl, "top-right");

      // 現在地ボタン
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      });
      map.current.addControl(geolocateControl, "top-right");

      // スケールコントロール
      const scaleControl = new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: "metric",
      });
      map.current.addControl(scaleControl, "bottom-left");
    }

    // ==========================================
    // イベントハンドラー
    // ==========================================
    map.current.on("load", () => {
      console.log("✅ 地図の読み込み完了");
    });

    map.current.on("moveend", () => {
      const center = map.current!.getCenter();
      const zoom = map.current!.getZoom();
      console.log(
        `📍 中心: (${center.lng.toFixed(4)}, ${center.lat.toFixed(4)}), ズーム: ${zoom.toFixed(2)}`
      );
    });

    map.current.on("error", (e) => {
      console.error("❌ 地図エラー:", e);
    });

    // ✅ クリーンアップ（コンポーネントがアンマウントされるときのみ）
    return () => {
      console.log("🗺️ 地図をクリーンアップ");
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current.clear();
      map.current?.remove();
      map.current = null;
    };
  }, []); // ✅ 完全に空の依存配列（初回のみ実行）

  // ==========================================
  // 2. マーカーの配置・更新（reports変更時のみ）
  // ==========================================
  useEffect(() => {
    if (!map.current) return;

    console.log(`📍 マーカー更新: ${reports.length}件のレポート`);

    // 現在のマーカーID一覧
    const currentIds = new Set(markersRef.current.keys());
    const newIds = new Set<string>();

    // 各レポートを処理
    reports.forEach((report) => {
      // 座標チェック
      if (!report.longitude || !report.latitude) {
        console.warn(`⚠️ 座標がありません: ${report.title}`);
        return;
      }

      if (!validateCoordinates(report.latitude, report.longitude, report.title)) {
        return;
      }

      newIds.add(report.id);

      // ✅ 既に存在する場合はスキップ（重要！）
      if (markersRef.current.has(report.id)) {
        return;
      }

      try {
        // ==========================================
        // マーカー要素の作成
        // ==========================================
        const el = document.createElement("div");
        el.className = "custom-marker";
        el.dataset.reportId = report.id;
        el.style.width = "44px";
        el.style.height = "44px";
        el.style.cursor = "pointer";

        const innerEl = document.createElement("div");
        innerEl.className = "custom-marker-inner";
        innerEl.style.width = "40px";
        innerEl.style.height = "40px";

        // サムネイル画像
        const thumbnailUrl =
          report.reportImages?.[0]?.imageUrl || "https://via.placeholder.com/40?text=📍";
        innerEl.style.backgroundImage = `url(${thumbnailUrl})`;
        innerEl.style.backgroundSize = "cover";
        innerEl.style.backgroundPosition = "center";
        innerEl.style.borderRadius = "50%";
        innerEl.style.border = "3px solid white";
        innerEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
        innerEl.style.transition = "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";

        el.appendChild(innerEl);

        // ==========================================
        // ホバーエフェクト
        // ==========================================
        el.addEventListener("mouseenter", () => {
          innerEl.style.transform = "scale(1.3)";
          innerEl.style.boxShadow = "0 6px 20px rgba(0,0,0,0.4), 0 0 0 8px rgba(59, 130, 246, 0.2)";
        });

        el.addEventListener("mouseleave", () => {
          // 選択中でない場合のみリセット
          if (!el.classList.contains("selected")) {
            innerEl.style.transform = "scale(1)";
            innerEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
          }
        });

        // ==========================================
        // マーカーを作成
        // ==========================================
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([report.longitude, report.latitude])
          .addTo(map.current!);

        // ==========================================
        // クリックイベント（重要：イベント伝播を停止）
        // ==========================================
        el.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation(); // ✅ 重要：地図へのクリック伝播を防ぐ
          console.log("📍 マーカークリック:", report.title);
          onMarkerClick?.(report);
        });

        // ==========================================
        // ポップアップ
        // ==========================================
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: false,
        }).setHTML(`
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">
              ${report.title}
            </h3>
            <p style="margin: 0; font-size: 12px; color: #666;">
              ${report.geocodedAddress || "住所不明"}
            </p>
          </div>
        `);

        marker.setPopup(popup);

        // ポップアップのタイマー管理
        let popupTimeout: NodeJS.Timeout;

        el.addEventListener("mouseenter", () => {
          clearTimeout(popupTimeout);
          popupTimeout = setTimeout(() => {
            popup.addTo(map.current!);
          }, 300); // 300ms 遅延
        });

        el.addEventListener("mouseleave", () => {
          clearTimeout(popupTimeout);
          popup.remove();
        });

        // ✅ Map に保存
        markersRef.current.set(report.id, { marker, element: el, report });
        console.log(`✅ マーカー追加: ${report.title}`);
      } catch (error) {
        console.error(`❌ マーカー作成失敗 [${report.title}]:`, error);
      }
    });

    // ==========================================
    // 削除されたマーカーを除去
    // ==========================================
    currentIds.forEach((id) => {
      if (!newIds.has(id)) {
        const markerData = markersRef.current.get(id);
        if (markerData) {
          markerData.marker.remove();
          markersRef.current.delete(id);
          console.log(`🗑️ マーカー削除: ${id}`);
        }
      }
    });

    console.log(`✅ 現在のマーカー数: ${markersRef.current.size}`);
  }, [reports, onMarkerClick]); // ✅ reports と onMarkerClick のみ

  // ==========================================
  // 3. 選択状態の更新（selectedReportId変更時のみ）
  // ==========================================
  useEffect(() => {
    markersRef.current.forEach(({ element }, id) => {
      const innerEl = element.querySelector(".custom-marker-inner") as HTMLElement;
      if (!innerEl) return;

      if (id === selectedReportId) {
        // 選択中
        element.classList.add("selected");
        innerEl.style.borderColor = "#3b82f6"; // 青い枠
        innerEl.style.borderWidth = "4px";
        innerEl.style.transform = "scale(1.15)";
        innerEl.style.boxShadow =
          "0 4px 16px rgba(59, 130, 246, 0.6), 0 0 0 4px rgba(59, 130, 246, 0.3)";
      } else {
        // 非選択
        element.classList.remove("selected");
        innerEl.style.borderColor = "white";
        innerEl.style.borderWidth = "3px";
        innerEl.style.transform = "scale(1)";
        innerEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      }
    });
  }, [selectedReportId]);

  return (
    <div
      ref={mapContainer}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

// ✅ memo でエクスポート（再レンダリング防止）
export const MapView = memo(MapViewComponent, (prevProps, nextProps): boolean => {
  // カスタム比較関数
  const reportsEqual =
    prevProps.reports?.length === nextProps.reports?.length &&
    prevProps.reports?.every((r, i) => r.id === nextProps.reports?.[i]?.id);

  return !!(
    prevProps.mapStyle === nextProps.mapStyle &&
    prevProps.center?.[0] === nextProps.center?.[0] &&
    prevProps.center?.[1] === nextProps.center?.[1] &&
    prevProps.zoom === nextProps.zoom &&
    prevProps.selectedReportId === nextProps.selectedReportId &&
    reportsEqual
    // onMarkerClick は比較しない（useCallbackでメモ化されている前提）
  );
});

MapView.displayName = "MapView";