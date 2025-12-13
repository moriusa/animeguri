import { SignUpFormValues } from "@/app/signUp/page";
import { User } from "@/types";

const API_ENDPOINT =
  "https://39vstgp97a.execute-api.ap-northeast-1.amazonaws.com";

export const createUserProfile = async (idToken: string) => {
  try {
    console.log("Creating user profile:", {
      // 🔍 デバッグログ追加
      endpoint: `${API_ENDPOINT}/user/me`,
    });

    const request = await fetch(`${API_ENDPOINT}/user/me`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      }
    });

    console.log("Response status:", request.status); // 🔍 レスポンスステータス確認
    console.log("Response headers:", Object.fromEntries(request.headers)); // 🔍 ヘッダー確認

    // レスポンステキストを先に取得してログ出力
    const responseText = await request.text(); // ✅ text()を先に実行
    console.log("Response text:", responseText); // 🔍 レスポンス内容確認

    if (!request.ok) {
      throw new Error(
        `HTTP error! status: ${request.status}, response: ${responseText}`
      ); // ✅ レスポンス内容も含める
    }

    // レスポンステキストをJSONとしてパース
    return JSON.parse(responseText); // ✅ 既に取得したテキストをパース
  } catch (err) {
    console.error("ユーザープロフィール作成エラー:", err);
    // console.error("Error details:", {
    //   // 🔍 詳細なエラー情報
    //   cognitoUserId,
    //   email: v.email,
    //   endpoint: API_ENDPOINT,
    // });
    throw err;
  }
};

export const getUserProfile = async (idToken: string): Promise<User> => {
  const response = await fetch(`${API_ENDPOINT}/user/me`, {
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
