import { fetcher } from "@/lib/fetcher";
import { ArticleCardResponse } from "@/types/api/article";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const getUserArticleCards = async (id: string) => {
  if (!id) return null;

  const res = await fetcher<ArticleCardResponse>(`${API_ENDPOINT}/user/${id}/articles`, 60);
  return res.data;
};
