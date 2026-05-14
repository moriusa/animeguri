import { SignUpFormValues } from "@/app/signUp/page";
import { UserInfo } from "@/features";
import {
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  resendSignUpCode,
  fetchAuthSession,
  getCurrentUser as amplifyGetCurrentUser,
  updatePassword,
  resetPassword,
  confirmResetPassword,
  fetchUserAttributes,
  confirmUserAttribute,
  updateUserAttributes,
  signInWithRedirect,
} from "aws-amplify/auth";

// ユーザープール情報
export interface SignUpResult {
  user: { getUsername: () => string };
  userSub: string;
}

// サインアップ
export const signUp = async (
  signUpData: SignUpFormValues,
): Promise<SignUpResult> => {
  const { email, password } = signUpData;
  const { userId } = await amplifySignUp({
    username: email,
    password,
    options: {
      userAttributes: { email },
    },
  });

  return {
    user: { getUsername: () => email },
    userSub: userId ?? "",
  };
};

// 確認コードによる認証
export const confirmSignUp = async (
  email: string,
  confirmationCode: string,
): Promise<string> => {
  await amplifyConfirmSignUp({
    username: email,
    confirmationCode,
  });
  return "SUCCESS";
};

// 確認コードの再送信
export const resendConfirmationCode = async (
  email: string,
): Promise<string> => {
  await resendSignUpCode({ username: email });
  return "SUCCESS";
};

// サインイン
export const signIn = async (
  email: string,
  password: string,
): Promise<UserInfo> => {
  await amplifySignIn({ username: email, password });

  const session = await fetchAuthSession();
  const attributes = await fetchUserAttributes();

  return {
    email: attributes.email ?? "",
    userId: attributes.sub ?? "",
    accessToken: session.tokens?.accessToken.toString() ?? "",
    idToken: session.tokens?.idToken?.toString() ?? "",
  };
};

// 現在のユーザー情報を取得
export const getCurrentUser = async (): Promise<UserInfo | null> => {
  try {
    await amplifyGetCurrentUser();
    const session = await fetchAuthSession();
    const attributes = await fetchUserAttributes();

    if (!session.tokens) return null;

    return {
      email: attributes.email ?? "",
      userId: attributes.sub ?? "",
      accessToken: session.tokens.accessToken.toString(),
      idToken: session.tokens.idToken?.toString() ?? "",
    };
  } catch {
    return null;
  }
};

// サインアウト
export const signOut = async (): Promise<void> => {
  await amplifySignOut();
};

// メールアドレス取得
export const getCurrentUserEmail = async (): Promise<string | null> => {
  try {
    const attributes = await fetchUserAttributes();
    return attributes.email ?? null;
  } catch {
    return null;
  }
};

// メールアドレス変更（確認コード送信）
export const updateEmail = async (newEmail: string): Promise<string> => {
  await updateUserAttributes({
    userAttributes: {
      email: newEmail,
    },
  });
  return "SUCCESS";
};

// メールアドレス変更の確認
export const verifyEmailChange = async (
  attributeName: string,
  confirmationCode: string,
): Promise<string> => {
  await confirmUserAttribute({
    userAttributeKey: "email",
    confirmationCode,
  });
  return "SUCCESS";
};

// パスワード変更
export const changePassword = async (
  oldPassword: string,
  newPassword: string,
): Promise<string> => {
  await updatePassword({ oldPassword, newPassword });
  return "SUCCESS";
};

// パスワードリセットリクエスト
export const forgotPassword = async (email: string): Promise<string> => {
  const result = await resetPassword({ username: email });
  return result.nextStep.codeDeliveryDetails?.destination ?? "SUCCESS";
};

// パスワードリセット確認
export const confirmPassword = async (
  email: string,
  confirmationCode: string,
  newPassword: string,
): Promise<string> => {
  await confirmResetPassword({ username: email, confirmationCode, newPassword });
  return "SUCCESS";
};

// アカウント削除
export const deleteUserViaBackend = async (idToken: string): Promise<void> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/delete`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) throw new Error("アカウントの削除に失敗しました");
};

// Googleログイン
export const signInWithGoogle = async (): Promise<void> => {
  await signInWithRedirect({ provider: "Google" });
};
