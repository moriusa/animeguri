import { signIn } from "@/lib";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { login, setUserProfile, UserInfo } from "./AuthSlice";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/userProfile";

export const useLogin = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // cognitoでログイン試行
      const cognitoUser: UserInfo = await signIn(email, pass);
      // 認証情報をReduxに保存
      dispatch(login(cognitoUser));
      // DynamoDBからユーザー情報を取得
      const userProfile = await getUserProfile(cognitoUser.idToken);
      console.log(userProfile)
      // Reduxにユーザー情報を保存
      dispatch(setUserProfile(userProfile));
      router.push("/");
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSubmit, email, pass, setEmail, setPass, isLoading };
};
