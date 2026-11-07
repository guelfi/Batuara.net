// Tipos do Bingo conforme docs/BINGO-CONTRATO.md

export interface BingoMenuItem {
  id: string;
  name: string;
  unitPrice: number;
  isAvailable: boolean;
}

export interface BingoPublicInfo {
  isOpen: boolean;
  eventName?: string;
  closeAllRequested: boolean;
  mesas: number[];
  menu: BingoMenuItem[];
}

export interface CreateBingoTabRequest {
  customerName: string;
  phone: string;
  mesa: number;
}

export interface CreateBingoTabResponse {
  tabId: string;
  reused: boolean;
}

export type BingoTabStatus = 'Open' | 'CloseRequested' | 'Paid';
export type BingoItemStatus = 'Pending' | 'Retrieved' | 'Delivered';
export type BingoPaymentMethod = 'Card' | 'Pix' | 'Cash';

export interface BingoTabItem {
  id: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  status: BingoItemStatus;
}

export interface BingoTabView {
  id: string;
  customerName: string;
  mesa: number;
  status: BingoTabStatus;
  total: number;
  closeAllRequested: boolean;
  isOpen: boolean;
  phoneVerified?: boolean;
  eventName?: string;
  menu: BingoMenuItem[];
  items: BingoTabItem[];
}

export interface BingoOrderLine {
  menuItemId: string;
  quantity: number;
}
