"use client";

import { useRef, memo } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAP_STYLES, type MapStyle } from "./mapStyles";
import { Report } from "@/types/api/article";
import { useMap } from "./useMap";
import { useMapMarkers } from "./useMapMarkers";

interface MapViewProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  showControls?: boolean;
  mapStyle?: MapStyle;
  reports?: Report[];
  onMarkerClick?: (report: Report) => void;
  selectedReportId?: string;
}

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

  // 地図の初期化
  const { map, isMapReady } = useMap({
    mapContainer,
    center,
    zoom,
    mapStyle,
    showControls,
  });

  // マーカーの管理
  useMapMarkers({ map, isMapReady, reports, onMarkerClick, selectedReportId });

  return (
    <div
      ref={mapContainer}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export const MapView = memo(MapViewComponent);
MapView.displayName = "MapView";
