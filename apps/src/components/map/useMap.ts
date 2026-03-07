// 地図初期化のカスタムフック
import { useEffect, useRef, RefObject, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MapStyle } from "./mapStyles";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

interface UseMapProps {
  mapContainer: RefObject<HTMLDivElement | null>;
  center: [number, number];
  zoom: number;
  mapStyle: MapStyle;
  showControls: boolean;
}

export const useMap = ({
  mapContainer,
  center,
  zoom,
  mapStyle,
  showControls,
}: UseMapProps) => {
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    setIsMapReady(false);

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center,
      zoom,
    });

    if (showControls) {
      addControls(map.current);
    }

    // スタイル読み込み完了後に通知
    map.current.on("load", () => {
      setIsMapReady(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return { map, isMapReady };
};

// コントロール追加を関数に分離
const addControls = (map: mapboxgl.Map) => {
  map.addControl(
    new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }),
    "top-right"
  );
  map.addControl(new mapboxgl.FullscreenControl(), "top-right");
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    }),
    "top-right"
  );
  map.addControl(
    new mapboxgl.ScaleControl({ maxWidth: 100, unit: "metric" }),
    "bottom-left"
  );
};