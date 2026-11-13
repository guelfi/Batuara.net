// Tipos novos do garçom (contas com itens, formas de pagamento) conforme docs/BINGO-CONTRATO.md

export type WaiterItemStatus = 'Pending' | 'Retrieved' | 'Delivered' | 'Contested' | 'Cancelled';

export interface WaiterAccountItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  status: WaiterItemStatus;
  deliveredAt: string | null;
  deliveredByName: string | null;
  contestedAt: string | null;
  contestNote: string | null;
  cancelledAt: string | null;
  cancelledByName: string | null;
  cancelReason: string | null;
}

export interface WaiterPaymentMethod {
  id: number;
  name: string;
}

export interface WaiterBill {
  tabId: string;
  mesa: number;
  customerName: string;
  status: 'Open' | 'CloseRequested' | 'Paid';
  phoneVerified: boolean;
  total: number;
  amountDue: number;
  undeliveredCount: number;
  contestedCount: number;
  items: WaiterAccountItem[];
}

export type ContestAction = 'ConfirmDelivered' | 'Cancel';

/** Estado de uma mesa para o garçom. */
export type WaiterTableState = 'Free' | 'HasSeats' | 'Full' | 'ExclusiveTaken';

export interface WaiterTableOccupant {
  nome: string;
  pessoas: number;
}

export interface WaiterTableStatus {
  numero: number;
  lugares: number;
  exclusiva: boolean;
  ocupados: number;
  livres: number;
  comandas: number;
  estado: WaiterTableState;
  ocupantes: WaiterTableOccupant[];
}
