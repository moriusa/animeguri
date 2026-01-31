"use client";

import { getPublicUserProfile } from "@/lib/userProfile";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@/types/api/user";

export const useGetPublicUserProfile = () => {
  const params = useParams();
  const id = params.id as string;
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getPublicUserProfile(id);
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch profile"
        );
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  return { profile, loading, error };
};
