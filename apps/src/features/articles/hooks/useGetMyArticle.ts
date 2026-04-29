"use client";
import useSWR from "swr";
import { authFetcher } from "@/lib/fetcher";
import { useParams } from "next/navigation";
import { Article, ArticleResponse } from "@/types/api/article";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const useGetMyArticle = () => {
  const params = useParams();
  const id = params.id as string;
  const { data, error, isLoading, mutate } = useSWR<Article | null>(
    `${API_ENDPOINT}/user/me/articles/${id}`,
    async () => {
      const res = await authFetcher<ArticleResponse>(`${API_ENDPOINT}/user/me/articles/${id}`);
      return res.data;
    },
  );
  return {
    article: data ?? null,
    isLoading,
    error: error,
    refreshArticle: () => mutate(),
  };
};
