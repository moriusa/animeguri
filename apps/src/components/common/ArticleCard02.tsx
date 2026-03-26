import { FaPen } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";
import Image from "next/image";
import { ArticleCard as ArticleCardType } from "@/types/api/article";
import Link from "next/link";
import { JapaneseDateTime } from "@/utils/formatDate";
import { fetchDeleteArticle } from "@/features/articles/deleteArticle";
import { redirect } from "next/navigation";
import { getValidIdToken } from "@/lib/common/authFetch";
import { useConfirm } from "./ConfirmDialog";

export const ArticleCard02 = ({ data }: { data: ArticleCardType }) => {
  const confirm = useConfirm();
  const published = data.articleStatus === "published";

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    redirect(`/post/edit/${data.id}`);
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const ok = await confirm({
      title: "本当に削除しますか？",
      description: "この操作は取り消せません。",
      confirmText: "削除",
      confirmVariant: "danger",
    });
    if (!ok) return;
    const idToken = await getValidIdToken();
    if (!idToken) {
      return;
    }
    const result = await fetchDeleteArticle(data.id, idToken);
    if (result.success) {
      window.location.reload();
    } else {
      alert(`削除に失敗: ${result.error}`);
    }
  };

  return (
    <>
      <Link
        className={`flex bg-white items-center gap-4 p-3 rounded-lg border border-gray-200 ${published && "hover:shadow-md transition-shadow"} ${!published && "pointer-events-none"}`}
        href={`/article/${data.id}`}
      >
        {/* 画像エリア */}
        <div className="flex-shrink-0">
          <Image
            src={data.thumbnailUrl || "/defaults/no-image.jpg"}
            alt={""}
            width={100}
            height={100}
            className="aspect-square object-cover rounded-md"
          />
        </div>

        {/* テキストエリア（左寄せ） */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="border-gray-300 border-1 rounded-2xl text-xs py-1 px-2 flex gap-1 items-center">
              <span className={`${published ? "bg-green-600" : "bg-gray-300"} w-3 h-3 rounded-full`}></span>
              <p className="inline-block">
                {published ? "公開" : "下書き"}
              </p>
            </div>
            <p className="text-gray-400 text-xs">
              {published
                ? new JapaneseDateTime(data.publishedAt).toJapanese()
                : new JapaneseDateTime(data.createdAt).toJapanese()}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-3">{data.animeName || "アニメ名未設定"}</p>
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{data.title || "タイトル未設定"}</h3>
        </div>

        {/* ボタンエリア */}
        <div className="flex-shrink-0 flex flex-col gap-3 pointer-events-auto">
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
    </>
  );
};
