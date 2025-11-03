import { User } from "@/types";

const API_ENDPOINT = "https://x44nkd1cc1.execute-api.ap-northeast-1.amazonaws.com";

export const getUserProfile = async (idToken: string): Promise<User> => {
  const response = await fetch(`${API_ENDPOINT}/user`, {
    method: "GET",
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
        errorData.message || "Failed to fetch user profile"
      }`
    );
  }

  return response.json();
};

const updateUserProfile = () => {};
