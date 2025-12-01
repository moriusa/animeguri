export type PopupType = 'success' | 'error' | 'confirm'

export interface PopupContent {
  type: PopupType;
  title: string;
  message: string;
}