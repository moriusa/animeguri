"use client";

import React from "react";
import { Button, Input, GoogleButton } from "@/app/components";
import Link from "next/link";
import { useAuth } from "react-oidc-context";
import { Authenticator } from "@aws-amplify/ui-react";
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from "aws-amplify";
import { I18n } from "aws-amplify/utils";
// import { PT_BR } from "./translations/pt-br";
// I18n.putVocabularies(PT_BR);
// I18n.setLanguage('ja');

export const AuthForm = () => {
  const PT_BR = {
    ja: {
      // サインイン画面
      'Username': 'メールアドレス',
      'Password': 'パスワード',
      'Email Address *': 'メールアドレス',
      'Enter your phone_number': '電話番号を入力してください',
      'Enter your Username': 'ユーザー名を入力してください',
      'Enter your Password': 'パスワードを入力してください',
      'Confirm Password': 'パスワードを確認',
      'Please confirm your Password': 'パスワードを再入力してください',
      'Reset Password': 'パスワードのリセット',
      'Enter your username': '名前（ID）を入力してください',
      'Sign In': 'サインイン',
      'Sign in': 'サインイン',
      'Sign Up': 'サインアップ',
      'Forgot your password?': 'パスワードをお忘れの方',
      'Reset password': 'パスワードをリセット',
      'No account?': 'アカウントを持っていない方',
      'Create account': 'アカウントを作成',
      'Create Account': 'アカウントを作成',
      'Have an account?': 'アカウントお持ちの方',
      'Confirm Sign up': 'サインアップの確認',
      'Back to Sign In': 'サインインに戻る',
      'Send code': 'コードを送信',
  
      'Sign in to your account': 'アカウントにサインイン ',
      'Sign In with Amazon': 'Amazonでサインイン',
      'Sign In with Apple': 'Apple でサインイン',
      'Sign In with Facebook': 'Facebookでサインイン',
      'Sign In with Google': 'Googleでサインイン',
  
      'Sign Up to your account': 'アカウントを作成',
      'Sign Up with Amazon': 'Amazonでアカウントを作成',
      'Sign Up with Apple': 'Appleでアカウントを作成',
      'Sign Up with Facebook': 'Facebookでアカウントを作成',
      'Sign Up with Google': 'Googleでアカウントを作成',
  
      // 'Enter your confirmation code': '検証コードを入力してください',
      // 'Enter your new password': '新しいパスワードを入力してください',
      // 'Enter your password': 'パスワードを入力してください',
      // 'Enter your username': 'ユーザー名を入力してください',
      // 'Password cannot be empty': 'パスワードは必須入力です',
      // 'Please Sign In / Sign Up': 'サインインまたは新規登録をしてください',
      // 'User does not exist': 'ユーザーが存在しません',
      // 'Username cannot be empty': 'ユーザー名は必須入力です',
      // 'Username/client id combination not found.': 'ユーザー名が見つかりません',
  
      // 'Confirm': '送信',
      // 'Confirmation Code': '確認コード',
      // 'Resend Code': 'コードを再送',
      // 'We Emailed You': 'メールを送信しました',
      // 'Enter your code': '認証コード',
      //  // 必要に応じて他のラベルも追加
      // 'Password must have at least 8 characters': 'パスワードは8文字以上にしてください',
      // 'Your passwords must match': 'パスワードがマッチしません',
      // 'Password did not conform with policy: Password not long enough':'パスワードは8文字以上にしてください',
      // "2 validation errors detected: Value at 'password' failed to satisfy constraint: Member must have length greater than or equal to 6; Value at 'password' failed to satisfy constraint: Member must satisfy regular expression pattern: ^[\S]+.*[\S]+$": 'パスワードは8文字以上、大文字小文字を含む英数字を指定してください',
      // 'User does not exist.': 'ユーザーが存在しません',
      // 'Incorrect username or password.': 'ユーザー名またはパスワードが違います',
      // 'User is not confirmed.': 'ユーザーは検証されていません',
      // 'User already exists': 'ユーザーは既に存在します',
      // 'Invalid verification code provided, please try again.': '指定された確認コードが無効です。もう一度お試しください',
      // 'Invalid password format': 'パスワードのフォーマットが不正です',
      // 'Invalid phone number format': '不正な電話番号フォーマットです。 電話番号は次のフォーマットで入力してください: +12345678900',
      // 'An account with the given email already exists.': 'そのメールアドレスは既に存在します',
      // 'Username cannot be empty': 'ユーザー名は必須です',
      // 'Password attempts exceeded': 'パスワード試行回数が超過しました',
      // 'Password cannot be empty': 'パスワードは必須入力です',
      // 'Attempt limit exceeded, please try after some time.': '試行制限を超過しました。しばらくしてからもう一度お試しください',
      // 'Username/client id combination not found.': 'ユーザーが存在しません',
      // 'CUSTOM_AUTH is not enabled for the client.': 'パスワードは必須です',
      // 'Password does not conform to policy: Password not long enough': 'パスワードは8文字以上を入力してください (8文字以上の大文字小文字を含む英数字)',
      // 'Password does not conform to policy: Password must have uppercase characters': 'パスワードには大文字を含めてください (8文字以上の大文字小文字を含む英数字)',
      // 'Password does not conform to policy: Password must have lowercase characters': 'パスワードには小文字を含めてください (8文字以上の大文字小文字を含む英数字)',
      // 'Password does not conform to policy: Password must have numeric characters': 'パスワードには数字を含めてください (8文字以上の大文字小文字を含む英数字)',
      // "1 validation error detected: Value at 'password' failed to satisfy constraint: Member must have length greater than or equal to 6": 'パスワードは8文字以上、大文字小文字を含む英数字を指定してください',
    },
  };
  // const auth = useAuth();

  // // if (auth.isLoading) {
  // //   return <div>Loading...</div>;
  // // }

  // // if (auth.error) {
  // //   return <div>Encountering error... {auth.error.message}</div>;
  // // }
  // const signOutRedirect = () => {
  //   const clientId = "3ieiqhe71jkq813kta7i1onqio";
  //   const logoutUri = "http://localhost:3000/login";
  //   const cognitoDomain = "https://ap-northeast-1ixz6ws2y8.auth.ap-northeast-1.amazoncognito.com";
  //   window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  // };

  // if (auth.isAuthenticated) {
  //   return (
  //     <div>
  //       <pre> Hello: {auth.user?.profile.email} </pre>
  //       <pre> ID Token: {auth.user?.id_token} </pre>
  //       <pre> Access Token: {auth.user?.access_token} </pre>
  //       <pre> Refresh Token: {auth.user?.refresh_token} </pre>

  //       <button onClick={signOutRedirect}>Sign out</button>
  //     </div>
  //   );
  // }
  I18n.putVocabularies(PT_BR);
  I18n.setLanguage('ja');
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: "ap-northeast-1_IXZ6Ws2y8",
        userPoolClientId: "3ieiqhe71jkq813kta7i1onqio",
        loginWith: {
          email: false,
        }
      },
    }
  });

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
