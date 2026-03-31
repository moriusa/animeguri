"use server";
import { LikeCheckResponse } from "@/types/api/like";
import dotenv from "dotenv";

dotenv.config();
const API_ENDPOINT = process.env.API_ENDPOINT;

export const addLike = async (articleId: string, idToken: string) => {
  const response = await fetch(`${API_ENDPOINT}/likes`, {
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
      `HTTP ${response.status}: ${errorData.message || "Failed to add like"}`,
    );
  }
};

export const deleteLike = async (articleId: string, idToken: string) => {
  const response = await fetch(`${API_ENDPOINT}/likes/${articleId}`, {
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
        errorData.message || "Failed to delete like"
      }`,
    );
  }
};

export const getLikeCheckSingle = async (
  articleId: string,
  idToken: string,
) => {
  const response = await fetch(
    `${API_ENDPOINT}/likes/check?articleId=${articleId}`,
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
        errorData.message || "Failed to get like check (single)"
      }`,
    );
  }
  const resData: LikeCheckResponse = await response.json();
  return resData;
};
