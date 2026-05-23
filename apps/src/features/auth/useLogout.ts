import { signOut } from "@/lib";
import { useConfirm } from "@/components/common/ConfirmDialog";
import { useGetUserProfile } from "../user/hooks/useGetUserProfile";

export const useLogout = () => {
  const confirm = useConfirm();
  const { clearUser } = useGetUserProfile();
  const handleLogout = async () => {
    const ok = await confirm({
      title: "本当にログアウトしますか？",
      description: "この操作は取り消せません。",
      confirmText: "ログアウト",
      confirmVariant: "danger",
    });
    if (!ok) return;
    signOut();
    clearUser();
  };

  return { handleLogout };
};
