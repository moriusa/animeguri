"use client";

import React from "react";
import { Button, Input, GoogleButton } from "@/app/components";
import Link from "next/link";
import { useAuth } from "react-oidc-context";

export const AuthForm = () => {
  const auth = useAuth();

  // if (auth.isLoading) {
  //   return <div>Loading...</div>;
  // }

  // if (auth.error) {
  //   return <div>Encountering error... {auth.error.message}</div>;
  // }

  if (auth.isAuthenticated) {
    return (
      <div>
        <pre> Hello: {auth.user?.profile.email} </pre>
        <pre> ID Token: {auth.user?.id_token} </pre>
        <pre> Access Token: {auth.user?.access_token} </pre>
        <pre> Refresh Token: {auth.user?.refresh_token} </pre>

        <button onClick={() => auth.removeUser()}>Sign out</button>
      </div>
    );
  }

  return (
    <form>
      <div className="mx-auto max-w-[34rem]">
        <h2 className="font-bold text-2xl text-center">'login'</h2>
            <div className="mt-7" onClick={()=>auth.signinRedirect()}>
              <Button text='ログイン' btnColor="blown" />
            </div>        
          <div className="border-t-1 border-gray-300 p-10">
            <GoogleButton text={`Googleでログイン`} />
            <div className="block mt-7 text-center">
            </div>
          </div>      
      </div>
    </form>
  );
};
