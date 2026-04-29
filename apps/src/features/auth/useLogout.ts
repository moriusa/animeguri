import { signOut } from "@/lib";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/common/ConfirmDialog";

export const useLogout = () => {
  const confirm = useConfirm();
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
    router.push("/login");
  };

  return { handleLogout };
};
