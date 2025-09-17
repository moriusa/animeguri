import { UserInfo } from "@/features";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";

// ユーザープール情報(環境変数から取得)
const userPool = new CognitoUserPool({
  UserPoolId: "ap-northeast-1_IXZ6Ws2y8",
  ClientId: "3ieiqhe71jkq813kta7i1onqio",
});

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
          // 他の情報も必要に応じて追加
          // name: result.getIdToken().payload.name || "",
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
    cognitoUser.getSession((err, session) => {
      if (err) {
        reject(err);
        return;
      }

      if (!session.isValid()) {
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
        };

        resolve(userInfo);
      });
    });
  });
};
