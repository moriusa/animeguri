"use client";
import useSWR from "swr";
import { authFetcher } from "@/lib/fetcher";
import { ArticleCardResponse } from "@/types/api/article";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const useGetMyArticleCards = (limit: number) => {
  const { data, error, isLoading, mutate } = useSWR<ArticleCardResponse | null>(
    `${API_ENDPOINT}/user/me/articles?limit=${limit}&status=all`,
    async () => {
      const res = await authFetcher<ArticleCardResponse>(`${API_ENDPOINT}/user/me/articles?limit=${limit}&status=all`);
      return res;
    },
  );
  return {
    articles: data?.data ?? null,
    pagination: data?.pagination,
    isLoading,
    error: error,
    refreshArticle: () => mutate(),
  };
};
