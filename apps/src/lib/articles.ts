"use cache";
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
  "https://39vstgp97a.execute-api.ap-northeast-1.amazonaws.com";

export const getArticleCards = async (
  limit: number
): Promise<ArticleCard[]> => {
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

  const resData: ArticleListResponse = await response.json();
  return resData.data;
};

export interface CreateArticleBody {
  title: string;
  thumbnail_s3_key: string | null;
  anime_name: string;
  article_status?: "draft" | "published" | "archived";
  reports: {
    title: string;
    description?: string;
    location: string;
    display_order: number; // 1~10
    images: {
      s3_key: string;
      caption?: string;
      display_order: number; // 1~10
    }[];
  }[];
}

export const createArticle = async (article: CreateArticleBody, idToken: string) => {
  const response = await fetch(`${API_ENDPOINT}/articles`, {
    method: "POST",
    body: JSON.stringify(article),
    headers: {
      Authorization: `Bearer ${idToken}`,
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
};
