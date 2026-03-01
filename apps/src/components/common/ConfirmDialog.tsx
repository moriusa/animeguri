"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { IoIosClose } from "react-icons/io";
import { Button } from "./Button";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "danger";
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
  });

  // Promise の resolve を保持する ref
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    setOpen(true);

    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    resolveRef.current?.(true);
    resolveRef.current = null;
    setOpen(false);
  };

  const handleCancel = () => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setOpen(false);
  };

  // ×ボタンやオーバーレイクリックで閉じた場合
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleCancel();
    }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />

          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-primary rounded-lg shadow-lg p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 border-1 border-secondary">
            <Dialog.Close asChild>
              <button
                className="absolute right-3 top-3 opacity-70 transition-opacity hover:opacity-100 cursor-pointer"
                aria-label="閉じる"
              >
                <IoIosClose size={30} />
              </button>
            </Dialog.Close>

            <Dialog.Title className="text-lg font-semibold mb-2">
              {options.title}
            </Dialog.Title>

            {options.description && (
              <Dialog.Description className="text-sm text-gray-600 mb-4">
                {options.description}
              </Dialog.Description>
            )}

            <div className="flex justify-end gap-3 mt-10">
              <Button
                text={options.cancelText ?? "キャンセル"}
                btnColor="white"
                onClick={handleCancel}
              />
              <Button
                text={options.confirmText ?? "OK"}
                btnColor={
                  options.confirmVariant === "default" ? "blown" : "red"
                }
                onClick={handleConfirm}
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ConfirmContext.Provider>
  );
}

// カスタムフック
export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm must be used within ConfirmDialogProvider");
  }
  return confirm;
}
