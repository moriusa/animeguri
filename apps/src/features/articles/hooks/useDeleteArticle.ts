"use client";
import { useSWRConfig } from "swr";
import { authFetcher } from "@/lib/fetcher";
import { useState } from "react";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const useDeleteArticle = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate } = useSWRConfig();

  const deleteArticle = async (articleId: string) => {
    setIsSubmitting(true);
    try {
      await authFetcher(
        `${API_ENDPOINT}/articles/${articleId}`,
        {
          method: "DELETE",
        },
      );
      await mutate(
        (key) => typeof key === "string" && key.includes("/articles"),
      );
      await mutate((key) => typeof key === "string" && key.includes("/user"));
      await mutate(
        (key) => typeof key === "string" && key.includes("/reports"),
      );
      setIsSuccess(true)
    } catch (error) {
      console.error("削除エラー:", error);
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  return { deleteArticle, isSubmitting, isSuccess };
};
