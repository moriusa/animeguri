"use client";

import ConfirmDialog from "@/components/common/Popup";
import HomeArticles from "@/components/HomeArticles";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

// import { HomeArticles } from "./components";

export default function Home() {
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);

  // // ログイン済みの場合
  // if (auth.isAuthenticated) {
  //   return (
  //     <div>
  //       <h2>ログイン情報</h2>
  //       <pre> Hello: {auth.user?.profile.email} </pre>
  //       <pre> ID Token: {auth.user?.id_token} </pre>
  //       <pre> Access Token: {auth.user?.access_token} </pre>
  //       <pre> Refresh Token: {auth.user?.refresh_token} </pre>
  //       <button onClick={handleLogout}>ログアウト</button>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-16">
      <p>aboutpage</p>
      <ConfirmDialog />
      <HomeArticles type="latestArticles" />
      {/* <HomeArticles type="popularArticles" />
      <HomeArticles type="followArticles" />
      <HomeArticles type="latestArticles" />
      <HomeArticles type="latestComments" />
      <HomeArticles type="monthlyAnimeArticleRanking" /> */}
    </div>
  );
}
