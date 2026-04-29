"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ArticleCardResponse } from "@/types/api/article";
import { useParams } from "next/navigation";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const useGetUserArticleCards = (limit: number) => {
  const params = useParams();
  const id = params.id as string;
  const { data, error, isLoading, mutate } = useSWR<ArticleCardResponse | null>(
    `${API_ENDPOINT}/user/${id}/articles?limit=${limit}`,
    async () => {
      const res = await fetcher<ArticleCardResponse>(
        `${API_ENDPOINT}/user/${id}/articles?limit=${limit}`,
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
