"use client";

import { useEffect } from "react";
import { useGetUserProfile } from "@/features/user/hooks/useGetUserProfile";

export const useAuthInit = () => {
  const { user, isLoggedIn, error } = useGetUserProfile();

  useEffect(() => {
    const checkAuth = () => {
      if (isLoggedIn) return user;
      if (error) return console.log(error);
      return user;
    };

    checkAuth();
  }, [error, isLoggedIn, user]);
};
