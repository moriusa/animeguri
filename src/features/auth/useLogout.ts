import { signOut } from "@/lib";
import { useDispatch } from "react-redux";
import { logout } from "./AuthSlice";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const handleLogout = () => {
    // cognitoからサインアウト
    signOut();

    // redux更新
    dispatch(logout());
    router.push("/login");
  };

  return { handleLogout };
};
