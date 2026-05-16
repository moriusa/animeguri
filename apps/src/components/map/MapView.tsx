"use client";
import Map, {
  MapRef,
  Marker,
  Popup,
  StyleSpecification,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMemo, useRef, useState } from "react";
import { Report } from "@/types/api/article";
import { Button } from "../common";
import { IoIosClose, IoMdPin } from "react-icons/io";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Props = {
  initialReports: Report[];
  initialViewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  popType: "navigation" | "router";
};

export const MapView = ({
  initialReports,
  initialViewState,
  popType,
}: Props) => {
  const [popupInfo, setPopupInfo] = useState<null | Report>(null);
  const mapRef = useRef<MapRef>(null);
  const router = useRouter();
  // OpenStreetMapを表示するためのスタイル設定
  const mapStyle: StyleSpecification = {
    version: 8,
    sources: {
      "osm-tiles": {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
      },
    },
    layers: [
      {
        id: "osm-layer",
        type: "raster",
        source: "osm-tiles",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  };
  const pins = useMemo(
    () =>
      initialReports.map((data, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={data.longitude}
          latitude={data.latitude}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setPopupInfo(data);
            handleMarkerClick(data);
          }}
          color="red"
        ></Marker>
      )),
    [initialReports],
  );
  const handleMarkerClick = (report: Report) => {
    // ポップアップを表示
    setPopupInfo(report);

    // 2. その場所へスムーズに移動してズーム
    mapRef.current?.flyTo({
      center: [Number(report.longitude), Number(report.latitude)],
      zoom: 15, // お好みのズームレベル
      duration: 1000, // 1秒かけて移動
      essential: true,
    });
  };
  return (
    <div style={{ width: "100%", height: "70vh" }}>
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={mapStyle}
        maxZoom={18}
      >
        {pins}
        {popupInfo && (
          <Popup
            longitude={Number(popupInfo.longitude)}
            latitude={Number(popupInfo.latitude)}
            anchor="left"
            offset={[12, -15]} // ← マーカーとの距離
            onClose={() => setPopupInfo(null)}
            closeButton={false} // ボタンを自作にするならfalse
          >
            <div className="p-1 max-w-[260px]">
              <div className="flex justify-end">
                <IoIosClose
                  size={30}
                  onClick={() => setPopupInfo(null)}
                  className="cursor-pointer text-gray-600 hover:bg-gray-100 hover:text-black rounded-full"
                />
              </div>
              <h3 className="font-bold ml-2 text-sm">{popupInfo.title}</h3>
              <div className="flex items-center mt-2">
                <IoMdPin size={20} className="text-red-500" />
                <p className="text-xs">
                  {`${popupInfo.prefecture} ${popupInfo.city} ${popupInfo.streetAddress} ${popupInfo.spotName}` ||
                    "住所不明"}
                </p>
              </div>
              <Image
                src={popupInfo.reportImages[0].imageUrl}
                alt=""
                width={800}
                height={600}
                className="mt-2 w-full h-auto object-cover rounded-md"
              />
              <div className="mt-2">
                {popType === "router" ? (
                  <Button
                    text="記事を見る"
                    onClick={() =>
                      router.push(`/article/${popupInfo.articleId}`)
                    }
                  />
                ) : (
                  <a href={`#report-${popupInfo.id}`}>詳細を見る↓</a>
                )}
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};
