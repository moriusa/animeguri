"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAP_STYLES, type MapStyle } from "./mapStyles";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

interface MapViewProps {
  className?: string;
  center?: [number, number]; // [経度, 緯度]
  zoom?: number;
  showControls?: boolean; // コントロール表示のON/OFF
  mapStyle?: MapStyle;
}

export const MapView = ({
  className,
  center = [139.7671, 35.6812], // デフォルト: 東京
  zoom = 10,
  showControls = true,
  mapStyle = MAP_STYLES.streets,
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;
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
      // ナビゲーションコントロール（ズーム・回転ボタン）
      const navControl = new mapboxgl.NavigationControl({
        showCompass: true, // コンパス表示
        showZoom: true,    // ズームボタン表示
        visualizePitch: true, // ピッチ表示
      });
      map.current.addControl(navControl, "top-right");

      // フルスクリーンコントロール
      const fullscreenControl = new mapboxgl.FullscreenControl();
      map.current.addControl(fullscreenControl, "top-right");

      // 現在地ボタン（Geolocation）
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true, // 高精度モード
        },
        trackUserLocation: true, // ユーザーの移動を追跡
        showUserHeading: true,   // 向いている方向を表示
      });
      map.current.addControl(geolocateControl, "top-right");

      // スケールコントロール（距離表示）
      const scaleControl = new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: "metric", // メートル単位
      });
      map.current.addControl(scaleControl, "bottom-left");
    }

    // ==========================================
    // イベントハンドラー
    // ==========================================

    map.current.on("load", () => {
      console.log("✅ 地図の読み込み完了");
    });

    // 地図移動時のログ（開発時のデバッグ用）
    map.current.on("moveend", () => {
      const center = map.current!.getCenter();
      const zoom = map.current!.getZoom();
      console.log(`📍 中心: (${center.lng.toFixed(4)}, ${center.lat.toFixed(4)}), ズーム: ${zoom.toFixed(2)}`);
    });

    map.current.on("error", (e) => {
      console.error("❌ 地図エラー:", e);
    });

    return () => {
      console.log("🗺️ 地図をクリーンアップ");
      map.current?.remove();
      map.current = null;
    };
  }, [center, zoom, showControls, mapStyle]);

  return (
    <div
      ref={mapContainer}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
};