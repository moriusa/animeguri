"use client"
import { useBookmark } from "@/features/bookmarks/useBookmark";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

export const BookmarkButton = () => {
  const {
    isBookmarked,
    toggleBookmark,
    isToggling: isBookmarkToggling,
    isLoading: chkBookmarkLoading,
    error: bookmarkErr
  } = useBookmark();
  return (
    <section>
      <button
        onClick={toggleBookmark}
        disabled={isBookmarkToggling || chkBookmarkLoading}
        className={`mt-3 cursor-pointer`}
      >
        {isBookmarked ? <FaBookmark size={24} /> : <FaRegBookmark size={24} />}
      </button>
      {bookmarkErr && (
        <div className="text-red-600">
          <p>{bookmarkErr}</p>
          <button onClick={toggleBookmark}>再試行</button>
        </div>
      )}
    </section>
  );
};
