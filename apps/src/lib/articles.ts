"use cache";
import { getCurrentUser } from "./auth";
import { ArticleCardResponse, ArticleResponse } from "@/types/api/article";
import dotenv from "dotenv";

dotenv.config();
const API_ENDPOINT = process.env.API_ENDPOINT;

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
  thumbnailS3Key: string | null;
  animeName: string;
  articleStatus: "draft" | "published";
  reports: {
    title: string;
    description?: string;
    location: string;
    displayOrder: number;
    images: {
      s3Key: string;
      caption?: string;
      displayOrder: number;
    }[];
  }[];
}

export const createArticle = async (
  article: CreateArticleBody,
  idToken: string,
): Promise<ArticleResponse> => {
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
  return response.json();
};

export const deleteArticle = async (articleId: string, idToken: string) => {
  const response = await fetch(`${API_ENDPOINT}/articles/${articleId}`, {
    method: "DELETE",
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
