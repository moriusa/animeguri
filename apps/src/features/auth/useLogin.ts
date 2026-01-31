import { signIn } from "@/lib";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { login, setUserProfile, UserInfo } from "./AuthSlice";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/userProfile";
import { LoginFormValues } from "@/app/login/page";

export const useLogin = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (v: LoginFormValues) => {
    setIsLoading(true);
    try {
      // cognitoでログイン試行
      const cognitoUser: UserInfo = await signIn(v.email, v.password);
      // 認証情報をReduxに保存
      dispatch(login(cognitoUser));
      // DBからユーザー情報を取得
      const userProfile = await getUserProfile(cognitoUser.idToken);
      console.log(userProfile)
      // Reduxにユーザー情報を保存
      dispatch(setUserProfile(userProfile.data));
      router.push("/");
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};
