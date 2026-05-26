"use client";
import { useLike } from "@/features/likes/useLike";
import { useRouter } from "next/navigation";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useConfirm } from "../common/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";

export const LikeButton = () => {
  const router = useRouter();
  const confirm = useConfirm();
  const { isLoggedIn } = useAuth();
  const {
    isLiked,
    toggleLike,
    isToggling: isLikeToggling,
    isLoading: chkLikeLoading,
    error: likeError,
  } = useLike({ isLoggedIn });
  const handleLikeClick = async () => {
    try {
      await toggleLike();
    } catch (error: any) {
      // 未ログインエラーをキャッチしたらダイアログを出す
      if (error.message === "UNAUTHENTICATED") {
        const shouldRedirect = await confirm({
          title: "ログインが必要です",
          description: "いいね機能を利用するにはログインしてください。",
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
        onClick={handleLikeClick}
        disabled={isLikeToggling || chkLikeLoading}
        className={`mt-3 cursor-pointer`}
      >
        {isLiked && isLoggedIn ? (
          <FaHeart size={24} className="text-red-500" />
        ) : (
          <FaRegHeart size={24} />
        )}
      </button>
      {likeError && (
        <div className="text-sm text-red-600 mt-1">
          <p>通信エラーが発生しました。</p>
          <button onClick={handleLikeClick} className="underline text-xs">
            再試行
          </button>
        </div>
      )}
    </section>
  );
};
