import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";

export const signIn = (email: string, password: string) => {
  // ユーザープール情報(環境変数から取得)
  const userPool = new CognitoUserPool({
    UserPoolId: "ap-northeast-1_IXZ6Ws2y8",
    ClientId: "3ieiqhe71jkq813kta7i1onqio",
  });

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
        // JWTトークンをローカルストレージに保存
        localStorage.setItem(
          "accessToken",
          result.getAccessToken().getJwtToken()
        );
        localStorage.setItem("idToken", result.getIdToken().getJwtToken());
        resolve(result);
      },
      // 失敗時
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};
