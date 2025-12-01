import { PopupType } from "@/types";

export const MESSAGES = {
  // 成功系メッセージ
  S00001: {
    type: "success",
    title: "投稿完了",
    message: () => "投稿が完了しました！",
  },
  S00002: {
    type: "success",
    title: "ログイン成功",
    message: (userName: string) => `${userName}さん、おかえりなさい！`,
  },

  // エラー系メッセージ
  E00001: {
    type: "error",
    title: "投稿エラー",
    message: (reason?: string) =>
      reason
        ? `投稿に失敗しました:${reason}`
        : "投稿中にエラーが発生しました。もう一度お試しください。",
  },
  E00002: {
    type: "error",
    title: "ログインエラー",
    message: () => "ユーザー名またはパスワードが正しくありません。",
  },
  E00003: {
    type: "error",
    title: "ファイルサイズエラー",
    message: (maxSize: string) =>
      `ファイルサイズが上限(${maxSize})を超えています。`,
  },

  // 確認系メッセージ
  C00001: {
    type: "confirm",
    title: "未保存の変更",
    message: () =>
      "保存されていない変更があります。このまま離れてもよろしいですか？",
  },
  C00002: {
    type: "confirm",
    title: "削除確認",
    message: () => `削除してもよろしいですか？この操作は取り消せません。`,
  },
  C00003: {
    type: "confirm",
    title: "ログアウト確認",
    message: () => "ログアウトしますか？",
  },
} as const;

export type MessageKeys = keyof typeof MESSAGES;
