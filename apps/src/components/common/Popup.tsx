import { MESSAGES } from "@/features/popup";

type MessageKeys = keyof typeof MESSAGES;

interface PopupProps<T extends MessageKeys> {
  messageKey: T;
  params?: Parameters<(typeof MESSAGES)[T]["message"]>[0];
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void; // confirm タイプの場合のみ使用
}

export function Popup<T extends MessageKeys>({
  messageKey,
  params,
  isOpen,
  onClose,
  onConfirm,
}: PopupProps<T>) {
  if (!isOpen) return null;

  const messageConfig = MESSAGES[messageKey];
  const { type, title, message } = messageConfig;

  // パラメータを渡してメッセージを生成
  const messageText = message(params as any);

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className={`popup-content popup-${type}`}>
        <div className="popup-header">
          <h3>{title}</h3>
        </div>

        <div className="popup-body">
          <p>{messageText}</p>
        </div>

        <div className="popup-footer">
          {type === "confirm" ? (
            <>
              <button onClick={onClose} className="btn-cancel">
                キャンセル
              </button>
              <button onClick={handleConfirm} className="btn-confirm">
                確認
              </button>
            </>
          ) : (
            <button onClick={onClose} className="btn-ok">
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
