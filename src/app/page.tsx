'use client'
// import { HomeArticles } from "./components";

import { useAuth } from "react-oidc-context";

export default function Home() {
  const auth = useAuth();

  // ログアウト処理
  const handleLogout = () => {
    localStorage.setItem('hasClickedLogin', 'false');  // ログイン不許可状態に設定
    auth.removeUser(); // ユーザー情報を削除
    // navigate('/'); // ホームページにリダイレクト
  };

  // ログイン済みの場合
  if (auth.isAuthenticated) {
    return (
      <div>
        <h2>ログイン情報</h2>
        <pre> Hello: {auth.user?.profile.email} </pre>
        <pre> ID Token: {auth.user?.id_token} </pre>
        <pre> Access Token: {auth.user?.access_token} </pre>
        <pre> Refresh Token: {auth.user?.refresh_token} </pre>
        <button onClick={handleLogout}>ログアウト</button>
      </div>
    );
  }

  

  return (
    <div className="space-y-16">
      <p>aboutpage</p>
      {/* <HomeArticles type="popularArticles" />
      <HomeArticles type="followArticles" />
      <HomeArticles type="latestArticles" />
      <HomeArticles type="latestComments" />
      <HomeArticles type="monthlyAnimeArticleRanking" /> */}
    </div>
  );
}
