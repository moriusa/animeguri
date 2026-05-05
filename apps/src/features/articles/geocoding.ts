"use server";

interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

interface Location {
  prefecture: string;
  city: string;
  streetAddress?: string;
  spotName?: string;
}
const MAPBOX_TOKEN = process.env.MAPBOX_SECRET_TOKEN;

/**
 * Mapbox Geocoding APIで住所→緯度経度を取得
 */
export const geocodeAddress = async (
  location: Location,
): Promise<GeocodingResult | null> => {
  const { prefecture, city, streetAddress, spotName } = location;
  const address = `${prefecture} ${city} ${streetAddress} ${spotName}`

  if (!MAPBOX_TOKEN) {
    console.error("MAPBOX_SECRET_TOKEN が設定されていません");
    return null;
  }

  if (!address || address.trim() === "") {
    console.warn("住所が空です");
    return null;
  }

  try {
    console.log(`🗺️ Geocoding: "${address}"`);

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address,
      )}.json?` +
        new URLSearchParams({
          access_token: MAPBOX_TOKEN,
          country: "JP", // 日本に限定
          language: "ja", // 日本語
          limit: "1", // 最も関連性の高い結果のみ
        }),
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [longitude, latitude] = feature.center; // 注意: Mapboxは [経度, 緯度] の順

      const result: GeocodingResult = {
        latitude,
        longitude,
        formattedAddress: feature.place_name, // 例: "東京タワー, 4-2-8 Shibakoen, Minato, Tokyo 105-0011, Japan"
      };

      console.log(`✅ Geocoding成功:`, result);
      return result;
    }

    console.warn("Geocoding結果が見つかりませんでした");
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

/**
 * 複数の住所を一括でGeocoding（並列実行）
 */
export const geocodeAddresses = async (
  addresses: Location[],
): Promise<(GeocodingResult | null)[]> => {
  return Promise.all(addresses.map((addr) => geocodeAddress(addr)));
};