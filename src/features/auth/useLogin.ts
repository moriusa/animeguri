import { signIn } from "@/lib";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { login, UserInfo } from "./AuthSlice";
import { useRouter } from "next/navigation";

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
      const userInfo: UserInfo = await signIn(email, pass);
      // ユーザー情報をReduxに保存
      dispatch(login(userInfo));
      console.log("login success", userInfo);
      router.push("/");
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSubmit, email, pass, setEmail, setPass, isLoading };
};
