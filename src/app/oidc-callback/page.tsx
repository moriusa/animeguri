"use client";

import { useEffect } from "react";
import { useAuth } from "react-oidc-context";

export default function OidcRedirectCallbackPage() {
  const auth = useAuth();

  useEffect(() => {
    auth.signinRedirectCallback().catch((error) => {
      // eslint-disable-next-line no-console
      console.error("signinRedirectCallback error", error);
    });
  }, [auth]);

  return <div>認証処理中です…</div>;
} 