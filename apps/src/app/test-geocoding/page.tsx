"use client";
import { geocodeAddress } from "@/features/articles/geocoding";
import { useState } from "react";

export default function TestGeocodingPage() {
  const [address, setAddress] = useState("東京タワー");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    const geocoded = await geocodeAddress(address);
    setResult(geocoded);
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Geocoding テスト</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-2">住所を入力:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border p-2 w-full"
            placeholder="例: 東京タワー"
          />
        </div>

        <button
          onClick={handleTest}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "変換中..." : "Geocoding実行"}
        </button>

        {result && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-bold mb-2">結果:</h2>
            <pre>{JSON.stringify(result, null, 2)}</pre>

            <div className="mt-4">
              <a
                href={`https://www.google.com/maps?q=${result.latitude},${result.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Google Mapsで確認 →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}