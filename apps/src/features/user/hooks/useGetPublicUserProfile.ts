"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { User, UserResponse } from "@/types/api/user";
import { useParams } from "next/navigation";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const useGetPublicUserProfile = () => {
  const params = useParams();
  const id = params.id as string;
  const { data, error, isLoading, mutate } = useSWR<User | null>(
    `${API_ENDPOINT}/user/${id}`,
    async () => {
      const res = await fetcher<UserResponse>(`${API_ENDPOINT}/user/${id}`);
      return res.data;
    },
  );
  return {
    profile: data ?? null,
    isLoading,
    error: error,
    refreshProfile: () => mutate(),
    clearProfile: () => mutate(null, { revalidate: false }),
  };
};
