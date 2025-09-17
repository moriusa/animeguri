"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "@/lib/auth";
import { login, logout } from "./AuthSlice";

export const useAuthCheck = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userInfo = await getCurrentUser();

        if (userInfo) {
          // セッションが有効ならReduxに復元
          dispatch(login(userInfo));
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
