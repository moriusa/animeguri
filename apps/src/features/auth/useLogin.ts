import { signIn } from "@/lib";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginFormValues } from "@/app/login/page";
import { useGetUserProfile } from "../user/hooks/useGetUserProfile";

export const useLogin = () => {
  const router = useRouter();
  const { refreshUser } = useGetUserProfile();

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (v: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signIn(v.email, v.password);
      refreshUser();
      router.push("/");
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};
