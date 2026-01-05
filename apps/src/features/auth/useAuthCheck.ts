"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser } from "@/lib/auth";
import { login, logout, setUserProfile } from "./AuthSlice";
import { RootState } from "@/store";
import { getUserProfile } from "@/lib/userProfile";

export const useAuthCheck = () => {
  const dispatch = useDispatch();
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // cognitoセッション取得
        const userInfo = await getCurrentUser();

        if (userInfo) {
          // セッションが有効ならReduxに復元
          dispatch(login(userInfo));
          if (!userProfile) {
            // DynamoDBのユーザー情報も
            const dbUserProfile = await getUserProfile(userInfo.idToken);
            dispatch(setUserProfile(dbUserProfile));
          }
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        dispatch(logout());
      }
    };

    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
};
