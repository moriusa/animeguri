"use client";

import { AuthProvider } from "react-oidc-context";
import React from "react";

// Cognitoの設定（クライアント側）
const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_IXZ6Ws2y8",
  client_id: "3ieiqhe71jkq813kta7i1onqio",
  redirect_uri: "https://anipilgoo.web.app/",
  response_type: "code",
  scope: "phone openid email",
  extraQueryParams: { lang: 'ja' },
};

export function OidcProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider {...cognitoAuthConfig}>{children}</AuthProvider>;
} 