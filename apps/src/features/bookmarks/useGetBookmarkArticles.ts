"use client";

import { useEffect, useState } from "react";
import { getBookmarkArticles } from "@/lib/bookmarks";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { BookmarkArticleCardResponse } from "@/types/api/bookmark";

export const useGetBookmarkArticles = (limit: number) => {
  const idToken = useSelector((state: RootState) => state.auth.user?.idToken);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<BookmarkArticleCardResponse | null>(null);

  useEffect(() => {
    if (!limit || !idToken) {
      setLoading(false);
      return;
    }

    const fetchBookmark = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getBookmarkArticles(limit, idToken);
        setArticles(res);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch bookmark list"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookmark();
  }, [limit, idToken]);

  return { articles, loading, error };
};
