"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useParams } from "next/navigation";
import { Article, ArticleResponse } from "@/types/api/article";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const useGetArticle = () => {
  const params = useParams();
  const id = params.id as string;
  const { data, error, isLoading, mutate } = useSWR<Article | null>(
    `${API_ENDPOINT}/articles/${id}`,
    async () => {
      const res = await fetcher<ArticleResponse>(`${API_ENDPOINT}/articles/${id}`);
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
