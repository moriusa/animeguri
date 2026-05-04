import { fetcher } from "@/lib/fetcher";
import { ArticleResponse } from "@/types/api/article";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const getArticle = async (id: string) => {

  if (!id) return null;

  const res = await fetcher<ArticleResponse>(
    `${API_ENDPOINT}/articles/${id}`,
    60,
  );
  return res.data;
};
