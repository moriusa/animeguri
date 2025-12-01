"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "@/lib/auth";
import { login, logout, setUserProfile } from "./AuthSlice";
import { getUserProfile } from "@/lib/userProfile";

export const useAuthCheck = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // cognitoセッション取得
        const userInfo = await getCurrentUser();

        if (userInfo) {
          // セッションが有効ならReduxに復元
          dispatch(login(userInfo));
          // DynamoDBのユーザー情報も
          const userProfile = await getUserProfile(userInfo.idToken);
          dispatch(setUserProfile(userProfile));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        dispatch(logout());
      }
    };

    checkAuth();
  }, [dispatch]);
};
