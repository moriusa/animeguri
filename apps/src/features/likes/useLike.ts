"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import { authFetcher } from "@/lib/fetcher";
import { useState } from "react";
import { LikeCheckResponse } from "@/types/api/like";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const useLike = () => {
  const params = useParams();
  const articleId = params.id as string;
  const [isToggling, setIsToggling] = useState(false);

  // GET：SWRでいいね状態を取得
  const { data, error, isLoading, mutate } = useSWR<LikeCheckResponse>(
    articleId ? `${API_ENDPOINT}/likes/check?articleId=${articleId}` : null,
    authFetcher<LikeCheckResponse>,
  );

  const isLiked = data?.data.isLiked ?? false;

  // トグル：楽観的更新
  const toggleLike = async () => {
    if (!articleId || isToggling) return;

    setIsToggling(true);

    try {
      // 1. 楽観的更新（即座にUIを反転）
      await mutate(
        async () => {
          // 2. API呼び出し
          if (isLiked) {
            await authFetcher(`${API_ENDPOINT}/likes/${articleId}`, {
              method: "DELETE",
            });
          } else {
            await authFetcher(`${API_ENDPOINT}/likes`, {
              method: "POST",
              body: JSON.stringify({ articleId: articleId }),
            });
          }
          // 3. 成功 → 新しい状態を返す
          return { data: { isLiked: !isLiked } };
        },
        {
          // 楽観的更新：APIの結果を待たずにUIを更新
          optimisticData: { data: { isLiked: !isLiked } },
          // 失敗時は元に戻す
          rollbackOnError: true,
          // API成功後に再fetchはしない（自分で値を返しているから）
          revalidate: false,
        },
      );
    } catch (err) {
      console.error("Failed to toggle Like:", err);
    } finally {
      setIsToggling(false);
    }
  };

  return {
    isLiked,
    toggleLike,
    isToggling,
    isLoading, // 初回取得中
    error,
  };
};
