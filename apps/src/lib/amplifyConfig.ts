import { Amplify } from "aws-amplify";

const redirectUrl =
  process.env.NODE_ENV === "production"
    ? "https://www.animeguri.app"
    : "http://localhost:3000";
const oAuthDomain =
  process.env.NODE_ENV === "production"
    ? "animeguri-auth-prod.auth.ap-northeast-1.amazoncognito.com"
    : "animeguri-auth-dev.auth.ap-northeast-1.amazoncognito.com";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID!,
      loginWith: {
        oauth: {
          domain: oAuthDomain,
          scopes: ["email", "openid", "profile"],
          redirectSignIn: [redirectUrl],
          redirectSignOut: [redirectUrl],
          responseType: "code",
        },
      },
    },
  },
});
