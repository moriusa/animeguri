import { signOut } from "@/lib";
import { useDispatch } from "react-redux";
import { logout } from "./AuthSlice";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/common/ConfirmDialog";

export const useLogout = () => {
  const confirm = useConfirm();
  const dispatch = useDispatch();
  const router = useRouter();
  const handleLogout = async () => {
    const ok = await confirm({
      title: "本当にログアウトしますか？",
      description: "この操作は取り消せません。",
      confirmText: "ログアウト",
      confirmVariant: "danger",
    });
    if (!ok) return;
    // cognitoからサインアウト
    signOut();

    // redux更新
    dispatch(logout());
    router.push("/login");
  };

  return { handleLogout };
};
