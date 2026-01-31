"use client";

import { useEffect, useState } from "react";
import {
  getBookmarkCheckSingle,
  addBookmark,
  deleteBookmark,
} from "@/lib/bookmarks";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useParams } from "next/navigation";

export const useBookmark = () => {
  const idToken = useSelector((state: RootState) => state.auth.user?.idToken);
  const params = useParams();
  const articleId = params.id as string;

  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkLoading, setCheckLoading] = useState<boolean>(true); // 初回確認用
  const [error, setError] = useState<string | null>(null);

  // 初回マウント時にブックマーク状態を確認
  useEffect(() => {
    if (!articleId || !idToken) {
      setCheckLoading(false);
      return;
    }

    const fetchBookmarkStatus = async () => {
      try {
        setCheckLoading(true);
        const res = await getBookmarkCheckSingle(articleId, idToken);
        setIsBookmarked(res.data.isBookmarked);
      } catch (err) {
        console.error("Failed to check bookmark status:", err);
        // エラーでも続行（デフォルトはfalse）
      } finally {
        setCheckLoading(false);
      }
    };

    fetchBookmarkStatus();
  }, [articleId, idToken]);

  // 楽観的更新を含むトグル関数
  const toggleBookmark = async () => {
    if (!articleId || !idToken) {
      setError("Article ID or token is missing");
      return;
    }

    // 現在の状態を保存（ロールバック用）
    const previousState = isBookmarked;

    try {
      // 1. 先にUIを更新（楽観的更新）
      setIsBookmarked(!isBookmarked);
      setError(null);
      setLoading(true);

      // 2. API呼び出し
      if (previousState) {
        // ブックマーク済み → 削除
        await deleteBookmark(articleId, idToken);
        console.log("✓ Bookmark removed");
      } else {
        // 未ブックマーク → 追加
        await addBookmark(articleId, idToken);
        console.log("✓ Bookmark added");
      }

      // 成功（UIはすでに更新済み）
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);

      // 3. エラー時はロールバック
      setIsBookmarked(previousState);
      setError(
        err instanceof Error ? err.message : "Failed to toggle bookmark"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    isBookmarked,
    toggleBookmark,
    loading, // トグル処理中
    checkLoading, // 初回確認中
    error,
  };
};
