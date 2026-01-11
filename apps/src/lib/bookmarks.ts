"use server";
const API_ENDPOINT =
  "https://13ququ06v4.execute-api.ap-northeast-1.amazonaws.com";

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
      }`
    );
  }
};

export const deleteBookmark = async (articleId: string, idToken: string) => {
  const response = await fetch(`${API_ENDPOINT}/bookmarks`, {
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
        errorData.message || "Failed to delete bookmark"
      }`
    );
  }
};

export const getBookmarkArticles = async (limit: number, idToken: string) => {
  "use cache";
  const response = await fetch(
    `${API_ENDPOINT}/users/bookmarks?limit=${limit}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  // レスポンスの状態チェック
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(
      `HTTP ${response.status}: ${
        errorData.message || "Failed to get bookmark articles"
      }`
    );
  }

  return response.json();
};

export const getBookmarkCheckSingle = async (
  articleId: string,
  idToken: string
) => {
  const response = await fetch(
    `${API_ENDPOINT}/bookmarks/check?articleId=${articleId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  // レスポンスの状態チェック
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(
      `HTTP ${response.status}: ${
        errorData.message || "Failed to get bookmark check (single)"
      }`
    );
  }

  return response.json();
};
