import { getMyArticle } from "@/lib/articles";
import { getValidIdToken } from "@/lib/common/authFetch";
import { ArticleResponse } from "@/types/api/article";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export const useGetMyArticle = () => {
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<ArticleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      const idToken = await getValidIdToken();
      try {
        if (idToken) {
          setLoading(true);
          setError(null);
          const res = await getMyArticle(id, idToken);
          setArticle(res);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "記事の取得に失敗しました";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  return { article, loading, error };
};
