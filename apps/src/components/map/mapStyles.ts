// components/map/mapStyles.ts（新規作成）

export const MAP_STYLES = {
  streets: "mapbox://styles/mapbox/streets-v12",           // 標準（道路強調）
  outdoors: "mapbox://styles/mapbox/outdoors-v12",         // アウトドア（地形）
  light: "mapbox://styles/mapbox/light-v11",               // ライト
  dark: "mapbox://styles/mapbox/dark-v11",                 // ダーク
  satellite: "mapbox://styles/mapbox/satellite-v9",        // 衛星写真
  satelliteStreets: "mapbox://styles/mapbox/satellite-streets-v12", // 衛星+道路
  navigation: "mapbox://styles/mapbox/navigation-day-v1",  // ナビゲーション
} as const;

export type MapStyle = typeof MAP_STYLES[keyof typeof MAP_STYLES];