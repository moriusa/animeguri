import { getMyArticle } from "@/lib/articles";
import { RootState } from "@/store";
import { ArticleResponse } from "@/types/api/article";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export const useGetMyArticle = () => {
  const params = useParams();
  const id = params.id as string;
  const user = useSelector((state: RootState) => state.auth.user);

  const [article, setArticle] = useState<ArticleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getMyArticle(id, user!.idToken);
        setArticle(res);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "記事の取得に失敗しました";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, user]);

  return { article, loading, error };
};
