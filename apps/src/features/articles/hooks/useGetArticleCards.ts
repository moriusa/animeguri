"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ArticleCardResponse } from "@/types/api/article";

export type ArticleCardsFilters = {
  anime?: string | null;
  location?: string | null;
};

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const useGetArticleCards = (
  limit: number,
  filters?: ArticleCardsFilters,
) => {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (filters?.anime) params.set("anime", filters.anime);
  if (filters?.location) params.set("location", filters.location);
  const { data, error, isLoading, mutate } = useSWR<ArticleCardResponse | null>(
    `${API_ENDPOINT}/articles?${params.toString()}`,
    async () => {
      const res = await fetcher<ArticleCardResponse>(
        `${API_ENDPOINT}/articles?${params.toString()}`,
      );
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
