import { getMyArticleCards } from "@/lib/articles";
import { useEffect, useState } from "react";
import { ArticleCardResponse } from "@/types/api/article";
import { getValidIdToken } from "@/lib/common/authFetch";

export const useGetMyArticleCards = () => {
  const [articles, setArticles] = useState<ArticleCardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      const idToken = await getValidIdToken();
      try {
        if (idToken) {
          setLoading(true);
          const data = await getMyArticleCards(idToken, 10);
          setArticles(data);
        }
      } catch (err) {
        console.error("Failed to fetch articles:", err);
        setError("記事の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return { articles, loading, error };
};
