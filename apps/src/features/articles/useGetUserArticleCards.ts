import { getUserArticleCards } from "@/lib/articles";
import { ArticleCardResponse } from "@/types/api/article";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export const useGetUserArticleCards = () => {
  const params = useParams();
  const id = params.id as string;

  const [articles, setArticles] = useState<ArticleCardResponse | null>(null);
  const [loading, setLoading] = useState(true); // 初期値を true に
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      console.warn("Article ID is undefined");
      setLoading(false);
      return;
    }

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getUserArticleCards(id, 20);
        setArticles(res);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "記事の取得に失敗しました";
        console.error("Error fetching article:", err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  return { articles, loading, error };
};
