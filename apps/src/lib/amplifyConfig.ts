import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID!,
      loginWith: {
        oauth: {
          domain: "animeguri-auth-dev.auth.ap-northeast-1.amazoncognito.com",
          scopes: ["email", "openid", "profile"],
          redirectSignIn: [
            "http://localhost:3000/",
            "https://www.animeguri.app/",
          ],
          redirectSignOut: [
            "http://localhost:3000/",
            "https://www.animeguri.app/",
          ],
          responseType: "code",
        },
      },
    },
  },
});