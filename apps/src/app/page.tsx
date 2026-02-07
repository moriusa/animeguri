"use client";

import HomeArticles from "@/components/HomeArticles";
import { MAP_STYLES } from "@/components/map/mapStyles";
import { MapView } from "@/components/map/MapView";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

// import { HomeArticles } from "./components";

export default function Home() {
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);

  return (
    <main className="flex-1 relative">
      <div className="h-96 rounded-lg overflow-hidden border">
          <MapView />
        </div>

      {/* 地図上に表示するUI（後で実装） */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-600">
            📍 地図上のピンをクリックして聖地情報を見よう
          </p>
        </div>
      </div>
      <div className="space-y-16">
        <HomeArticles type="latestArticles" />
        {/* <HomeArticles type="popularArticles" />
      <HomeArticles type="followArticles" />
      <HomeArticles type="latestArticles" />
      <HomeArticles type="latestComments" />
      <HomeArticles type="monthlyAnimeArticleRanking" /> */}
      </div>
    </main>
  );
}
