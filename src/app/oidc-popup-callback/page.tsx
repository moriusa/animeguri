"use client";

import { useEffect } from "react";
import { useAuth } from "react-oidc-context";

export default function OidcPopupCallbackPage() {
  const auth = useAuth();

  useEffect(() => {
    auth.signinPopupCallback().catch((error) => {
      // eslint-disable-next-line no-console
      console.error("signinPopupCallback error", error);
    });
  }, [auth]);

  return <div>ポップアップ認証の処理中です…</div>;
} 