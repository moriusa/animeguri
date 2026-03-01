import { fetchDeleteArticle } from "@/features/articles/deleteArticle";
import { JapaneseDateTime } from "@/utils/formatDate";
import { redirect } from "next/navigation";
import { FaTrashAlt } from "react-icons/fa";
import { FaPen } from "react-icons/fa6";
import { useConfirm } from "@/components/common/ConfirmDialog";
import Image from "next/image";
import { ArticleCard as ArticleCardType } from "@/types/api/article";
import { getValidIdToken } from "@/lib/common/authFetch";

export const DraftArticleCard = ({ data }: { data: ArticleCardType }) => {
  const confirm = useConfirm();

  const handleEdit = () => {
    redirect(`/post/edit/${data.id}`);
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "下書きを削除しますか？",
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
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-dashed border-yellow-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
              下書き
            </span>
            <span className="text-xs text-gray-500">
              {new JapaneseDateTime(data.updatedAt).toJapanese()}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          {/* サムネイル */}
          <div className="flex-shrink-0">
            <Image
              src={data.thumbnailUrl || "/defaults/no-image.jpg"}
              alt=""
              width={80}
              height={80}
              className="aspect-square object-cover rounded-md opacity-70"
            />
          </div>

          {/* テキスト情報 */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">
              {data.animeName || "作品名未設定"}
            </p>
            <h3 className="font-bold text-base mb-1 line-clamp-2 text-gray-700">
              {data.title || "タイトル未設定"}
            </h3>
            <p className="text-xs text-gray-500">
              レポート数: {data.reportCount || 0}件
            </p>
          </div>
        </div>

        {/* アクションボタン（横並び） */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <FaPen size={14} />
            編集を続ける
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg transition-colors"
            aria-label="削除"
          >
            <FaTrashAlt size={14} />
          </button>
        </div>
      </div>
    </>
  );
};
