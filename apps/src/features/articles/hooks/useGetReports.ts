"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ReportsResponse } from "@/types/api/article";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const useGetReports = () => {
  const { data, error, isLoading, mutate } = useSWR<ReportsResponse | null>(
    `${API_ENDPOINT}/reports`,
    async () => {
      const res = await fetcher<ReportsResponse>(
        `${API_ENDPOINT}/reports`,
      );
      return res;
    },
  );
  return {
    reports: data?.data ?? null,
    isLoading,
    error: error,
    refreshArticle: () => mutate(),
  };
};
