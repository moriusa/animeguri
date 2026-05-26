"use client";
import { useBookmark } from "@/features/bookmarks/useBookmark";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { useConfirm } from "../common/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export const BookmarkButton = () => {
  const router = useRouter();
  const confirm = useConfirm();
  const { isLoggedIn } = useAuth();
  const {
    isBookmarked,
    toggleBookmark,
    isToggling: isBookmarkToggling,
    isLoading: chkBookmarkLoading,
    error: bookmarkErr,
  } = useBookmark({ isLoggedIn });
  const handleBookmarkClick = async () => {
    try {
      await toggleBookmark();
    } catch (error: any) {
      // 未ログインエラーをキャッチしたらダイアログを出す
      if (error.message === "UNAUTHENTICATED") {
        const shouldRedirect = await confirm({
          title: "ログインが必要です",
          description: "ブックマーク機能を利用するにはログインしてください。",
          confirmText: "ログイン画面へ",
          cancelText: "閉じる",
          confirmVariant: "default",
        });

        // ユーザーが「ログイン画面へ」を押した場合
        if (shouldRedirect) {
          router.push("/login");
        }
      }
    }
  };
  return (
    <section>
      <button
        onClick={handleBookmarkClick}
        disabled={isBookmarkToggling || chkBookmarkLoading}
        className={`mt-3 cursor-pointer`}
      >
        {isBookmarked && isLoggedIn ? (
          <FaBookmark size={24} className="text-red-500" />
        ) : (
          <FaRegBookmark size={24} />
        )}
      </button>
      {bookmarkErr && (
        <div className="text-sm text-red-600 mt-1">
          <p>通信エラーが発生しました。</p>
          <button onClick={handleBookmarkClick} className="underline text-xs">
            再試行
          </button>
        </div>
      )}
    </section>
  );
};
