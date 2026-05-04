import { fetcher } from "@/lib/fetcher";
import { UserResponse } from "@/types/api/user";

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export const getPublicUserProfile = async (id: string) => {
  if (!id) return null;

  const res = await fetcher<UserResponse>(`${API_ENDPOINT}/user/${id}`, 60);
  return res.data;
};
