// Tipos do módulo Bingo (contrato: docs/BINGO-CONTRATO.md)

export type BingoPaymentMethod = 'Card' | 'Pix' | 'Cash';
export type BingoTabStatus = 'Open' | 'CloseRequested' | 'Paid';
export type BingoItemStatus = 'Pending' | 'Retrieved' | 'Delivered' | 'Contested' | 'Cancelled';

export type BingoEventStatus = 'Draft' | 'Open' | 'Closed' | 'Suspended';

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
  menuItemId?: string | null;
  deliveredAt?: string | null;
  deliveredByName?: string | null;
  retrievedByName?: string | null;
  contestedAt?: string | null;
  contestNote?: string | null;
  cancelledAt?: string | null;
  cancelledByName?: string | null;
  cancelReason?: string | null;
}

export interface BingoPayMethod {
  id: number;
  name: string;
  isActive: boolean;
  sortOrder: number;
}

export interface BingoPayMethodInput {
  name: string;
  isActive: boolean;
  sortOrder: number;
}

export interface BingoPendingTab {
  tabId: string;
  customerName: string;
  undeliveredCount: number;
  contestedCount: number;
}

export interface BingoTab {
  tabId: string;
  mesa: number | string;
  customerName: string;
  status: BingoTabStatus;
  total: number;
  amountDue: number;
  undeliveredCount: number;
  contestedCount: number;
  paymentMethod?: string | null;
  paidByName?: string | null;
  paidAt?: string | null;
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
  contestedItems?: number;
  cancelledItems?: number;
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
  count?: number;
  total: number;
}

export interface BingoSummary {
  totalSold: number;
  totalOpen: number;
  byPayment: BingoSummaryLine[];
  byItem: BingoSummaryLine[];
  cancelledTotal: number;
  contestedOpen: number;
  photoCount: number;
  photoTotal: number;
  photoUnmatched: number;
  grandTotal: number;
  byWaiter: BingoWaiterSummary[];
}

export interface BingoWaiterSummary {
  name: string;
  count: number;
  total: number;
  byMethod: { method: string; total: number }[];
}

// ---- Garçom (sessão normal de filho da Casa) ----
export interface WaiterStatus {
  isWaiter: boolean;
  eventOpen: boolean;
  eventName: string | null;
  waiterName?: string | null;
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
