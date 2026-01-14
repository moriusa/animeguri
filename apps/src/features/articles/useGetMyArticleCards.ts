import { getMyArticleCards } from "@/lib/articles";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { ArticleCard as ArticleCardType } from "@/types";

export const useGetMyArticleCards = () => {
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
  }, [user]);

  return { articles, loading, error };
};
