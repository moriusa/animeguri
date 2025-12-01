'use cache';
import { ArticleCard } from "@/types";

interface ArticleListResponse {
  success: boolean;
  data: ArticleCard[];
  count?: number;
  error?: string;
  message?: string;
  meta?: {
    requestedLimit: number;
    hasMissingAuthors: boolean;
  };
}

const API_ENDPOINT =
  "https://x44nkd1cc1.execute-api.ap-northeast-1.amazonaws.com";

export const getArticleCards = async (limit: number): Promise<ArticleCard[]> => {
  const response = await fetch(`${API_ENDPOINT}/articles?limit=${limit}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  // レスポンスの状態チェック
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(
      `HTTP ${response.status}: ${
        errorData.message || "Failed to fetch articles"
      }`
    );
  }

  const resData: ArticleListResponse = await response.json()
  return resData.data;
};
