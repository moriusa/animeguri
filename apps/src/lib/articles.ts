"use cache";
import { getCurrentUser } from "./auth";
import { ArticleCardResponse, ArticleResponse } from "@/types/api/article";

const API_ENDPOINT =
  "https://13ququ06v4.execute-api.ap-northeast-1.amazonaws.com";

export const getArticle = async (id: string) => {
  const response = await fetch(`${API_ENDPOINT}/articles/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(
      `HTTP ${response.status}: ${
        errorData.message || "Failed to fetch articles"
      }`,
    );
  }
  const resData: ArticleResponse = await response.json();
  return resData;
};

export const getArticleCards = async (
  limit: number,
): Promise<ArticleCardResponse> => {
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
      }`,
    );
  }

  const resData: ArticleCardResponse = await response.json();
  return resData;
};

export const getUserArticleCards = async (
  id: string,
  limit: number,
): Promise<ArticleCardResponse> => {
  const response = await fetch(
    `${API_ENDPOINT}/user/${id}/articles?limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  // レスポンスの状態チェック
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(
      `HTTP ${response.status}: ${
        errorData.message || "Failed to fetch articles"
      }`,
    );
  }

  const resData: ArticleCardResponse = await response.json();
  return resData;
};

export const getMyArticleCards = async (
  idToken: string,
  limit: number,
): Promise<ArticleCardResponse> => {
  await getCurrentUser();
  const response = await fetch(
    `${API_ENDPOINT}/user/me/articles?limit=${limit}&status=all`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    },
  );
  // レスポンスの状態チェック
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(
      `HTTP ${response.status}: ${
        errorData.message || "Failed to fetch articles"
      }`,
    );
  }

  const resData: ArticleCardResponse = await response.json();
  return resData;
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

export const createArticle = async (
  article: CreateArticleBody,
  idToken: string,
) => {
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
      }`,
    );
  }
};

export const deleteArticle = async (articleId: string, idToken: string) => {
  const response = await fetch(`${API_ENDPOINT}/articles`, {
    method: "DELETE",
    body: JSON.stringify({ articleId: articleId }),
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
        errorData.message || "Failed to delete articles"
      }`,
    );
  }
};
