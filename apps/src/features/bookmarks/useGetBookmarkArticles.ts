"use client";

import { useEffect, useState } from "react";
import { getBookmarkArticles } from "@/lib/bookmarks";
import { BookmarkArticleCardResponse } from "@/types/api/bookmark";
import { getValidIdToken } from "@/lib/common/authFetch";

export const useGetBookmarkArticles = (limit: number) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<BookmarkArticleCardResponse | null>(
    null,
  );

  useEffect(() => {
    const fetchBookmark = async () => {
      const idToken = await getValidIdToken();
      if (!limit || !idToken) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        const res = await getBookmarkArticles(limit, idToken);
        setArticles(res);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch bookmark list",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookmark();
  }, [limit]);

  return { articles, loading, error };
};
