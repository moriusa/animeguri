"use server";
import {
  BookmarkArticleCardResponse,
  BookmarkCheckResponse,
} from "@/types/api/bookmark";
import dotenv from "dotenv";

dotenv.config();
const API_ENDPOINT = process.env.API_ENDPOINT;

export const addBookmark = async (articleId: string, idToken: string) => {
  const response = await fetch(`${API_ENDPOINT}/bookmarks`, {
    method: "POST",
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
        errorData.message || "Failed to add bookmark"
      }`,
    );
  }
};

export const deleteBookmark = async (articleId: string, idToken: string) => {
  const response = await fetch(`${API_ENDPOINT}/bookmarks/${articleId}`, {
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
        errorData.message || "Failed to delete bookmark"
      }`,
    );
  }
};

export const getBookmarkArticles = async (
  limit: number,
  idToken: string,
): Promise<BookmarkArticleCardResponse> => {
  "use cache";
  const response = await fetch(
    `${API_ENDPOINT}/users/bookmarks?limit=${limit}`,
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
        errorData.message || "Failed to get bookmark articles"
      }`,
    );
  }

  return response.json();
};

export const getBookmarkCheckSingle = async (
  articleId: string,
  idToken: string,
) => {
  const response = await fetch(
    `${API_ENDPOINT}/bookmarks/check?articleId=${articleId}`,
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
        errorData.message || "Failed to get bookmark check (single)"
      }`,
    );
  }
  const resData: BookmarkCheckResponse = await response.json();
  return resData;
};
