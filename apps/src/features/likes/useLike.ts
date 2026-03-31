"use client";

import { useEffect, useState } from "react";
import { getLikeCheckSingle, addLike, deleteLike } from "@/lib/Likes";
import { useParams } from "next/navigation";
import { getValidIdToken } from "@/lib/common/authFetch";

export const useLike = () => {
  const params = useParams();
  const articleId = params.id as string;

  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkLoading, setCheckLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      const idToken = await getValidIdToken();
      if (!articleId || !idToken) {
        setCheckLoading(false);
        return;
      }
      try {
        setCheckLoading(true);
        const res = await getLikeCheckSingle(articleId, idToken);
        setIsLiked(res.data.isLiked);
      } catch (err) {
        console.error("Failed to check Like status:", err);
        // エラーでも続行（デフォルトはfalse）
      } finally {
        setCheckLoading(false);
      }
    };

    fetchLikeStatus();
  }, [articleId]);

  // 楽観的更新を含むトグル関数
  const toggleLike = async () => {
    const idToken = await getValidIdToken();
    if (!articleId || !idToken) {
      setError("Article ID or token is missing");
      return;
    }

    // 現在の状態を保存（ロールバック用）
    const previousState = isLiked;

    try {
      // 1. 先にUIを更新（楽観的更新）
      setIsLiked(!isLiked);
      setError(null);
      setLoading(true);

      // 2. API呼び出し
      if (previousState) {
        // いいね済み → 削除
        await deleteLike(articleId, idToken);
        console.log("✓ Like removed");
      } else {
        // 未いいね → 追加
        await addLike(articleId, idToken);
        console.log("✓ Like added");
      }

      // 成功（UIはすでに更新済み）
    } catch (err) {
      console.error("Failed to toggle Like:", err);

      // 3. エラー時はロールバック
      setIsLiked(previousState);
      setError(err instanceof Error ? err.message : "Failed to toggle Like");
    } finally {
      setLoading(false);
    }
  };

  return {
    isLiked,
    toggleLike,
    loading, // トグル処理中
    checkLoading, // 初回確認中
    error,
  };
};
