"use server";
import { deleteArticle } from "@/lib/articles";
import { revalidatePath } from "next/cache";

export const fetchDeleteArticle = async (
  articleId: string,
  idToken: string,
) => {
  if (!articleId) {
    const errorMsg = "記事IDが指定されていません";
    console.warn(errorMsg);
    return { success: false, error: errorMsg };
  }

  if (!idToken) {
    const errorMsg = "ログインが必要です";
    console.warn(errorMsg);
    return { success: false, error: errorMsg };
  }

  try {
    const res = await deleteArticle(articleId, idToken);
    console.log("削除成功:", res);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "記事の削除に失敗しました";

    console.error("削除エラー:", err);

    return { success: false, error: errorMessage };
  }
};
