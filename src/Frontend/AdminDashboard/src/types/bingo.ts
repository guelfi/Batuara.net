// Tipos do módulo Bingo (contrato: docs/BINGO-CONTRATO.md)

export type BingoPaymentMethod = 'Card' | 'Pix' | 'Cash';
export type BingoTabStatus = 'Open' | 'CloseRequested' | 'Paid';
export type BingoItemStatus = 'Pending' | 'Retrieved' | 'Delivered';

export type BingoEventStatus = 'Draft' | 'Open' | 'Closed';

export interface BingoEvent {
  id: string;
  name: string;
  eventDate: string;
  status: BingoEventStatus;
  isTest: boolean;
  closeAllRequested: boolean;
  totalSold: number;
}

export interface BingoMenuItem {
  id: string;
  name: string;
  unitPrice: number;
  isAvailable: boolean;
  sortOrder: number;
}

export interface BingoMenuItemInput {
  name: string;
  unitPrice: number;
  isAvailable: boolean;
  sortOrder: number;
}

export interface BingoOrderItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  status: BingoItemStatus;
  createdAt?: string;
}

export interface BingoTab {
  tabId: string;
  mesa: number | string;
  customerName: string;
  status: BingoTabStatus;
  total: number;
  paymentMethod?: BingoPaymentMethod | null;
  items: BingoOrderItem[];
  phoneVerified?: boolean;
  codeDeliveryStatus?: 'Sent' | 'Delivered' | 'Read' | 'Failed' | null;
  codeDeliveryError?: string | null;
  reminderSentAt?: string | null;
  reminderDeliveryStatus?: string | null;
}

export interface BingoReminderPreviewItem {
  tabId: string;
  customerName: string;
  mesa: number | string;
  total: number;
  reminderSentAt: string | null;
}

export interface BingoReminderPreview {
  count: number;
  totalOwed: number;
  items: BingoReminderPreviewItem[];
}

export interface BingoReminderResult {
  sent: number;
  skipped: number;
  failed: number;
}

export interface BingoPanel {
  phoneVerifiedCount?: number;
  phoneNotVerifiedCount?: number;
  codeDeliveryFailedCount?: number;
  closeAllRequested?: boolean;
  totalSold?: number;
  retrievedItems?: number;
  tabs: BingoTab[];
}

export interface BingoWaiter {
  houseMemberId: string | number;
  name: string;
  lastSeenAt?: string | null;
  deliveries: number;
}

export interface BingoSummaryLine {
  label: string;
  quantity?: number;
  total: number;
}

export interface BingoSummary {
  totalSold: number;
  totalOpen: number;
  byPayment: BingoSummaryLine[];
  byItem: BingoSummaryLine[];
}

// ---- Garçom (sessão normal de filho da Casa) ----
export interface WaiterStatus {
  isWaiter: boolean;
  eventOpen: boolean;
  eventName: string | null;
}

export interface WaiterOrderItem {
  id: string;
  name: string;
  quantity: number;
  createdAt: string;
  status: 'Pending' | 'Retrieved';
  retrievedByName: string | null;
  retrievedByMe: boolean;
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
