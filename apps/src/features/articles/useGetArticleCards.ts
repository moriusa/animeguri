"use client";
import { ArticleCardsFilters, getArticleCards } from "@/lib/articles";
import { ArticleCardResponse } from "@/types/api/article";
import { useEffect, useState } from "react";

export const useGetArticleCards = (
  limit: number,
  filters?: ArticleCardsFilters,
) => {
  const [articles, setArticles] = useState<ArticleCardResponse | null>(null);
  const [loading, setLoading] = useState(true); // ✅ 初期値を true に
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getArticleCards(limit, filters);
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
  }, []);

  return { articles, loading, error };
};
