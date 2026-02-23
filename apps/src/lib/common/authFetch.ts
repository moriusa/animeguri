import {
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

export const getValidIdToken = async (): Promise<string | null> => {
  const user = userPool.getCurrentUser();
  if (!user) return null;

  return new Promise((resolve, reject) => {
    user.getSession((err: Error, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) return resolve(null);
      resolve(session.getIdToken().getJwtToken());
    });
  });
};

// export const authFetch = async (input: RequestInfo, init: RequestInit = {}) => {
//   const idToken = await getValidIdToken();
//   if (!idToken) throw new Error("Not logged in");

//   return fetch(input, {
//     ...init,
//     headers: {
//       ...(init.headers || {}),
//       Authorization: `Bearer ${idToken}`,
//     },
//   });
// };
