"use client";
import { BookmarkArticleCardResponse } from "@/types/api/bookmark";
import { authFetcher } from "@/lib/fetcher";
import useSWR from "swr";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const useGetBookmarkArticles = (limit: number) => {
  const { data, error, isLoading, mutate } = useSWR<BookmarkArticleCardResponse | null>(
    `${API_ENDPOINT}/users/bookmarks?limit=${limit}`,
    async () => {
      const res = await authFetcher<BookmarkArticleCardResponse>(`${API_ENDPOINT}/users/bookmarks?limit=${limit}`);
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
