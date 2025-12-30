// hooks/useGetArticle.ts
import { getArticle } from "@/lib/articles";
import { Article } from "@/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export const useGetArticle = () => {
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true); // ✅ 初期値を true に
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      console.warn("⚠️ Article ID is undefined");
      setLoading(false);
      return;
    }

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔍 Fetching article with ID:", id);

        const res = await getArticle(id);

        console.log("✅ Article fetched successfully:", res.id);
        setArticle(res);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "記事の取得に失敗しました";

        console.error("❌ Error fetching article:", err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  return { article, loading, error };
};
