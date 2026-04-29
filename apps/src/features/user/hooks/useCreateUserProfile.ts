"use client";
import { authFetcher } from "@/lib/fetcher";
import { UserResponse } from "@/types/api/user";
import { useState } from "react";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const useCreateUserProfile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createProfile = async () => {
    setIsSubmitting(true);
    try {
      const res = await authFetcher<UserResponse>(`${API_ENDPOINT}/user/me`, {
        method: "POST",
      });
      console.log(res);
    } catch (error) {
      console.error("プロフィール更新失敗:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  return {
    createProfile,
    isSubmitting,
  };
};
