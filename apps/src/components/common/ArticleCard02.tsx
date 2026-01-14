import { FaPen } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";
import Image from "next/image";
import { ArticleCard as ArticleCardType } from "@/types";
import Link from "next/link";
import { JapaneseDateTime } from "@/utils/formatDate";
import { s3KeyToImageUrl } from "@/utils/s3KeyToImageUrl";
import { fetchDeleteArticle } from "@/features/articles/deleteArticle";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export const ArticleCard02 = ({ data }: { data: ArticleCardType }) => {
  const idToken = useSelector((state: RootState) => state.auth.user?.idToken);

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(data.anime_name);
  };
  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm(`「${data.title}」を削除しますか？`)) {
      return;
    }
    if (!idToken) return;
    const result = await fetchDeleteArticle(data.id, idToken);
    window.location.reload();
    if (!result.success) {
      alert(`削除に失敗: ${result.error}`);
    }
  };
  return (
    <Link
      className="flex bg-white items-center gap-4 p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
      href={`/article/${data.id}`}
    >
      {/* 画像エリア */}
      <div className="flex-shrink-0">
        <Image
          src={s3KeyToImageUrl(data.thumbnail_s3_key)}
          alt={""}
          width={100}
          height={100}
          className="aspect-square object-cover rounded-md"
        />
      </div>

      {/* テキストエリア（左寄せ） */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-1">{data.anime_name}</p>
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{data.title}</h3>
        <p className="text-gray-400 text-xs">
          {new JapaneseDateTime(data.published_at).toJapanese()}
        </p>
        <p className="text-gray-500 text-sm mb-1">{data.article_status}</p>
      </div>

      {/* ボタンエリア */}
      <div className="flex-shrink-0 flex flex-col gap-3">
        <button
          className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer"
          aria-label="編集"
          onClick={handleEdit}
        >
          <FaPen size={16} className="text-gray-600" />
        </button>
        <button
          className="p-2 hover:bg-red-50 rounded transition-colors cursor-pointer"
          aria-label="削除"
          onClick={handleDelete}
        >
          <FaTrashAlt size={16} className="text-red-600" />
        </button>
      </div>
    </Link>
  );
};
