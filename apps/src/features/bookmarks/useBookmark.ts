"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import { authFetcher } from "@/lib/fetcher";
import { useState } from "react";
import { BookmarkCheckResponse } from "@/types/api/bookmark";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const useBookmark = () => {
  const params = useParams();
  const articleId = params.id as string;
  const [isToggling, setIsToggling] = useState(false);

  // GET：SWRでブックマーク状態を取得
  const { data, error, isLoading, mutate } = useSWR<BookmarkCheckResponse>(
    articleId ? `${API_ENDPOINT}/bookmarks/check?articleId=${articleId}` : null,
    authFetcher<BookmarkCheckResponse>,
  );

  const isBookmarked = data?.data.isBookmarked ?? false;

  // トグル：楽観的更新
  const toggleBookmark = async () => {
    if (!articleId || isToggling) return;

    setIsToggling(true);

    try {
      // 1. 楽観的更新（即座にUIを反転）
      await mutate(
        async () => {
          // 2. API呼び出し
          if (isBookmarked) {
            await authFetcher(`${API_ENDPOINT}/bookmarks/${articleId}`, {
              method: "DELETE",
            });
          } else {
            await authFetcher(`${API_ENDPOINT}/bookmarks`, {
              method: "POST",
              body: JSON.stringify({ articleId: articleId }),
            });
          }
          // 3. 成功 → 新しい状態を返す
          return { data: { isBookmarked: !isBookmarked } };
        },
        {
          // 楽観的更新：APIの結果を待たずにUIを更新
          optimisticData: { data: { isBookmarked: !isBookmarked } },
          // 失敗時は元に戻す
          rollbackOnError: true,
          // API成功後に再fetchはしない（自分で値を返しているから）
          revalidate: false,
        },
      );
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    } finally {
      setIsToggling(false);
    }
  };

  return {
    isBookmarked,
    toggleBookmark,
    isToggling,
    isLoading, // 初回取得中
    error,
  };
};
