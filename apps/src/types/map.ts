export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodingResult extends Coordinates {
  formattedAddress: string; // 正規化された住所
}

export interface ReportLocation extends Coordinates {
  reportId: string;
  title: string;
  animeName: string;
  thumbnailUrl: string;
  prefecture: string;
  city: string;
  streetAddress?: string;
  spotName?: string;
}
