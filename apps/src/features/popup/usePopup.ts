import { useState, useCallback } from 'react';
import { MessageKeys, MESSAGES } from './';

export function usePopup() {
  const [popupState, setPopupState] = useState<{
    isOpen: boolean;
    messageKey: MessageKeys | null;
    params?: any;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    messageKey: null,
  });

  const showPopup = useCallback(<T extends MessageKeys>(
    messageKey: T,
    params?: Parameters<typeof MESSAGES[T]['message']>[0],
    onConfirm?: () => void
  ) => {
    setPopupState({
      isOpen: true,
      messageKey,
      params,
      onConfirm,
    });
  }, []);

  const closePopup = useCallback(() => {
    setPopupState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    popupState,
    showPopup,
    closePopup,
  };
}