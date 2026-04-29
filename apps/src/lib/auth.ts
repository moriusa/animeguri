import { SignUpFormValues } from "@/app/signUp/page";
import { UserInfo } from "@/features";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

const AWS_COGNITO_USER_POOL_ID =
  process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!;
const AWS_COGNITO_CLIENT_ID = process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID!;

// ユーザープール情報
const userPool = new CognitoUserPool({
  UserPoolId: AWS_COGNITO_USER_POOL_ID,
  ClientId: AWS_COGNITO_CLIENT_ID,
});

export interface SignUpResult {
  user: CognitoUser;
  userSub: string;
}

export const signUp = (signUpData: SignUpFormValues): Promise<SignUpResult> => {
  const { email, password } = signUpData;
  // ユーザー属性を設定
  const attributeList: CognitoUserAttribute[] = [];

  // メールアドレス属性（必須）
  const dataEmail = {
    Name: "email",
    Value: email,
  };
  const attributeEmail = new CognitoUserAttribute(dataEmail);
  attributeList.push(attributeEmail);

  return new Promise((resolve, reject) => {
    userPool.signUp(
      email,
      password,
      attributeList,
      [], // validationData（通常は空配列）
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        if (!result) {
          reject(new Error("サインアップに失敗しました"));
          return;
        }

        resolve({
          user: result.user,
          userSub: result.userSub,
        });
      },
    );
  });
};

// 確認コードによる認証
export const confirmSignUp = (
  email: string,
  confirmationCode: string,
): Promise<string> => {
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result || "SUCCESS");
    });
  });
};

// 確認コードの再送信
export const resendConfirmationCode = (email: string): Promise<string> => {
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result || "SUCCESS");
    });
  });
};

export const signIn = (email: string, password: string): Promise<UserInfo> => {
  // ユーザーログイン情報
  const authenticationDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  // 非同期処理を使うためにPromise型を返り値にする
  return new Promise((resolve, reject) => {
    // ログイン処理
    cognitoUser.authenticateUser(authenticationDetails, {
      // 成功時
      onSuccess: (result) => {
        const accessToken = result.getAccessToken().getJwtToken();
        const idToken = result.getIdToken().getJwtToken();

        const userInfo: UserInfo = {
          email: email,
          userId: result.getIdToken().payload.sub, // CognitoのユーザーID
          accessToken: accessToken,
          idToken: idToken,
        };

        resolve(userInfo);
      },
      // 失敗時
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

// 現在のユーザーセッションを取得
export const getCurrentUser = (): Promise<UserInfo | null> => {
  const cognitoUser = userPool.getCurrentUser();

  if (!cognitoUser) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    // getSessionは内部で自動的にトークンをリフレッシュしてくれる
    cognitoUser.getSession((err: Error, session: CognitoUserSession | null) => {
      if (err) {
        reject(err);
        return;
      }

      if (session === null || !session.isValid()) {
        resolve(null);
        console.log("セッションが無効です");
        return;
      }

      // セッションが有効
      cognitoUser.getUserAttributes((err, attributes) => {
        if (err) {
          reject(err);
          return;
        }

        const userInfo: UserInfo = {
          email: attributes?.find((attr) => attr.Name === "email")?.Value || "",
          userId: session.getIdToken().payload.sub,
          accessToken: session.getAccessToken().getJwtToken(),
          idToken: session.getIdToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
        };

        resolve(userInfo);
      });
    });
  });
};

export const signOut = () => {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut(); // cognitoが自動的にLocalStorageをクリアする
  }
};

// ============================================
// 🆕 ユーザー属性の更新
// ============================================
export interface UpdateUserAttributesParams {
  email?: string;
  name?: string;
  phoneNumber?: string;
  // カスタム属性も追加可能
  // customAttribute?: string;
}

const updateUserAttributes = (
  attributes: UpdateUserAttributesParams,
): Promise<string> => {
  const cognitoUser = userPool.getCurrentUser();

  if (!cognitoUser) {
    return Promise.reject(new Error("ユーザーがログインしていません"));
  }

  return new Promise((resolve, reject) => {
    cognitoUser.getSession((err: Error, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        reject(new Error("セッションが無効です"));
        return;
      }

      const attributeList: CognitoUserAttribute[] = [];

      // メールアドレス
      if (attributes.email) {
        attributeList.push(
          new CognitoUserAttribute({
            Name: "email",
            Value: attributes.email,
          }),
        );
      }

      // // 名前
      // if (attributes.name) {
      //   attributeList.push(
      //     new CognitoUserAttribute({
      //       Name: "name",
      //       Value: attributes.name,
      //     })
      //   );
      // }

      // // 電話番号
      // if (attributes.phoneNumber) {
      //   attributeList.push(
      //     new CognitoUserAttribute({
      //       Name: "phone_number",
      //       Value: attributes.phoneNumber,
      //     })
      //   );
      // }

      cognitoUser.updateAttributes(attributeList, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result || "SUCCESS");
      });
    });
  });
};

// IDトークンからメールアドレスを取得
export const getCurrentUserEmail = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const currentUser = userPool.getCurrentUser();
    if (!currentUser) return resolve(null);

    // getSession() でストレージからセッションを読み込む
    currentUser.getSession((err: any, session: any) => {
      // エラーがある場合は、Errorオブジェクトではなく null を返す
      if (err || !session || !session.isValid()) {
        console.error("Cognito session error:", err);
        return resolve(null);
      }

      const payload = session.getIdToken().decodePayload();
      resolve(payload.email);
    });
  });
};

// ============================================
// 🆕 メールアドレス変更（確認コード送信）
// ============================================
export const updateEmail = (newEmail: string): Promise<string> => {
  return updateUserAttributes({ email: newEmail });
};

// ============================================
// 🆕 メールアドレス変更の確認
// ============================================
export const verifyEmailChange = (
  attributeName: string,
  confirmationCode: string,
): Promise<string> => {
  const cognitoUser = userPool.getCurrentUser();

  if (!cognitoUser) {
    return Promise.reject(new Error("ユーザーがログインしていません"));
  }

  return new Promise((resolve, reject) => {
    cognitoUser.getSession((err: Error, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        reject(new Error("セッションが無効です"));
        return;
      }

      cognitoUser.verifyAttribute(attributeName, confirmationCode, {
        onSuccess: (result) => {
          resolve(result || "SUCCESS");
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  });
};

// ============================================
// 🆕 パスワード変更
// ============================================
export const changePassword = (
  oldPassword: string,
  newPassword: string,
): Promise<string> => {
  const cognitoUser = userPool.getCurrentUser();

  if (!cognitoUser) {
    return Promise.reject(new Error("ユーザーがログインしていません"));
  }

  return new Promise((resolve, reject) => {
    cognitoUser.getSession((err: Error, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        reject(new Error("セッションが無効です"));
        return;
      }

      cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result || "SUCCESS");
      });
    });
  });
};

// ============================================
// 🆕 パスワードリセットリクエスト（忘れた場合）
// ============================================
export const forgotPassword = (email: string): Promise<string> => {
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.forgotPassword({
      onSuccess: (data) => {
        resolve(data.CodeDeliveryDetails?.Destination || "SUCCESS");
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

// ============================================
// 🆕 パスワードリセットの確認
// ============================================
export const confirmPassword = (
  email: string,
  confirmationCode: string,
  newPassword: string,
): Promise<string> => {
  const cognitoUser = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.confirmPassword(confirmationCode, newPassword, {
      onSuccess: () => {
        resolve("SUCCESS");
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

// ============================================
// 🆕 ユーザーアカウント削除（推奨: バックエンド経由）
// ============================================
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

  if (!response.ok) {
    throw new Error("アカウントの削除に失敗しました");
  }
};
