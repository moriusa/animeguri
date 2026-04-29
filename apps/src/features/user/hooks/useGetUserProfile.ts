"use client";
import useSWR from "swr";
import { authFetcher } from "@/lib/fetcher";
import { User, UserResponse } from "@/types/api/user";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const useGetUserProfile = () => {
  const { data, error, isLoading, mutate } = useSWR<User | null>(
    `${API_ENDPOINT}/user/me`,
    async () => {
      const res = await authFetcher<UserResponse>(`${API_ENDPOINT}/user/me`);
      return res.data;
    },
  );
  return {
    user: data ?? null,
    isLoading,
    isLoggedIn: !!data,
    error: error,
    refreshUser: () => mutate(),
    clearUser: () => mutate(null, { revalidate: false }),
    updateUser: (newData: User) =>
      mutate((current) => (current ? { ...current, ...newData } : current), {
        revalidate: false,
      }),
  };
};
