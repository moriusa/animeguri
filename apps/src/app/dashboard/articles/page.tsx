'use client'
import { ArticleCard } from "@/components/common/ArticleCard";
import { getMyArticleCards } from "@/lib/articles";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { ArticleCard as ArticleCardType } from "@/types";

const Page = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [articles, setArticles] = useState<ArticleCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await getMyArticleCards(user!.idToken, 10);
        setArticles(data);
      } catch (err) {
        console.error("Failed to fetch articles:", err);
        setError("記事の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchArticles();
    }
  }, [user]); // userが変わったら再取得

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (articles.length === 0) {
    return <div className="text-center py-8">記事がありません</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} data={article} />
        ))}
      </div>
    </div>
  );
};

export default Page;
