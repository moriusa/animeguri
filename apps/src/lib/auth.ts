import { SignUpFormValues } from "@/app/signUp/page";
import { UserInfo } from "@/features";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

// ユーザープール情報(環境変数から取得)
const userPool = new CognitoUserPool({
  UserPoolId: "ap-northeast-1_IXZ6Ws2y8",
  ClientId: "3ieiqhe71jkq813kta7i1onqio",
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

  // 名前属性（オプション）
  // if (name) {
  //   const dataName = {
  //     Name: "name",
  //     Value: name,
  //   };
  //   const attributeName = new CognitoUserAttribute(dataName);
  //   attributeList.push(attributeName);
  // }

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
      }
    );
  });
};

// 確認コードによる認証
export const confirmSignUp = (
  email: string,
  confirmationCode: string
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
