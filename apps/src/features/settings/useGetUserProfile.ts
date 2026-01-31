"use client";
import { getUserProfile } from "@/lib/userProfile";
import { User } from "@/types/api/user";
import { useEffect, useState } from "react";

export const useGetUserProfile = (idToken: string) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idToken) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getUserProfile(idToken);
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch profile",
        );
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [idToken]);

  return { profile, loading, error };
};
