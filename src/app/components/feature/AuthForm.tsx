"use client";

import React from "react";
import { Button, Input, GoogleButton } from "@/app/components";
import Link from "next/link";
import { Authenticator } from "@aws-amplify/ui-react";
import '@aws-amplify/ui-react/styles.css';

export const AuthForm = () => {

  return (
    <Authenticator
      
      hideSignUp={false}
      components={{
        Header() {
          return (
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">ログイン</h2>
            </div>
          );
        },
        Footer() {
          return (
            <div className="text-center mt-4 text-sm text-gray-600">
              <p>アカウントをお持ちでない方は新規登録してください</p>
            </div>
          );
        }
      }}
    >
      {({ signOut, user }) => (
        <main className="p-6">
          <div className="max-w-md mx-auto">
            <h1 className="text-xl font-semibold mb-4">
              Hello {user?.signInDetails?.loginId || user?.username}
            </h1>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> {user?.signInDetails?.loginId}</p>
              <p><strong>User ID:</strong> {user?.userId}</p>
              <p><strong>Sign In Method:</strong> {user?.signInDetails?.authFlowType}</p>
            </div>
            <button 
              onClick={signOut}
              className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              ログアウト
            </button>
          </div>
        </main>
      )}
    </Authenticator>
  );
};
