import { getUserProfile } from "@/lib/userProfile";
import { useEffect, useState } from "react";

// res型
export interface UserProfile {
  id: string;
  user_name: string;
  bio?: string;
  profile_image_s3_key?: string;
  x_url?: string;
  facebook_url?: string;
  youtube_url?: string;
  website_url?: string;
}

export const useGetUserProfile = (idToken: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // idTokenがない場合は何もしない
    if (!idToken) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getUserProfile(idToken);
        setProfile(res);
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
  }, [idToken]);

  return { profile, loading, error };
};
