"use client"
import { useLike } from "@/features/likes/useLike";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export const LikeButton = () => {
  const {
    isLiked,
    toggleLike,
    isToggling: isLikeToggling,
    isLoading: chkLikeLoading,
    error: likeError,
  } = useLike();
  return (
    <section>
      <button
        onClick={toggleLike}
        disabled={isLikeToggling || chkLikeLoading}
        className={`mt-3 cursor-pointer`}
      >
        {isLiked ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
      </button>
      {likeError && (
        <div className="text-red-600">
          <p>{likeError}</p>
          <button onClick={toggleLike}>再試行</button>
        </div>
      )}
    </section>
  );
};
