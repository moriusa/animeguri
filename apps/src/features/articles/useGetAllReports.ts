import { getAllReports } from "@/lib/articles";
import { ReportsResponse } from "@/types/api/article";
import { useEffect, useState } from "react";

export const useGetAllReports = () => {
  const [reports, setReports] = useState<ReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAllReports();
        setReports(res);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "レポートの取得に失敗しました";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, []);

  return { reports, loading, error };
};
