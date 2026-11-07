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
export type BingoItemStatus = 'Pending' | 'Delivered';
export type BingoPaymentMethod = 'Card' | 'Pix' | 'Cash';

export interface BingoTabItem {
  id: string;
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
  eventName?: string;
  menu: BingoMenuItem[];
  items: BingoTabItem[];
}

export interface BingoOrderLine {
  menuItemId: string;
  quantity: number;
}

export interface WaiterLoginResponse {
  token: string;
  expiresAt: string;
  name: string;
}

export interface WaiterOrderItem {
  id: string;
  name: string;
  quantity: number;
  createdAt: string;
}

export interface WaiterOrderGroup {
  mesa: number;
  tabId: string;
  customerName: string;
  items: WaiterOrderItem[];
}

export interface WaiterAccount {
  tabId: string;
  mesa: number;
  customerName: string;
  total: number;
  status: BingoTabStatus;
}
