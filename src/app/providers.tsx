"use client";

import { AuthProvider } from "react-oidc-context";
import React from "react";
import { WebStorageStateStore } from "oidc-client-ts";

// Cognitoの設定（クライアント側）
const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_IXZ6Ws2y8",
  client_id: "3ieiqhe71jkq813kta7i1onqio",
  redirect_uri: "http://localhost:3000",
  response_type: "code",
  scope: "phone openid email",
  extraQueryParams: { lang: 'ja' },
  // LocalStorageにセッション情報を保存
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  stateStore: new WebStorageStateStore({ store: window.localStorage }),
};

export function OidcProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider {...cognitoAuthConfig}>{children}</AuthProvider>;
} 