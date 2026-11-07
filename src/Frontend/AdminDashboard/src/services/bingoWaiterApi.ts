import apiService from './api';
import { ContestAction, WaiterBill, WaiterPaymentMethod } from '../types/bingoWaiter';

const asArray = (v: any): any[] => (Array.isArray(v) ? v : []);
const n = (v: any): number => (typeof v === 'number' ? v : Number(v) || 0);

export interface ExitCheck {
  paid: boolean;
  mesa: number;
  customerName: string;
  total: number;
  amountDue: number;
  paymentMethod: string | null;
  paidAt: string | null;
  exitCheckedAt: string | null;
  exitCheckedByName: string | null;
}

const toExit = (d: any): ExitCheck => ({
  paid: !!d?.paid,
  mesa: n(d?.mesa),
  customerName: d?.customerName ?? '',
  total: n(d?.total),
  amountDue: n(d?.amountDue),
  paymentMethod: d?.paymentMethod ?? null,
  paidAt: d?.paidAt ?? null,
  exitCheckedAt: d?.exitCheckedAt ?? null,
  exitCheckedByName: d?.exitCheckedByName ?? null,
});

const bingoWaiterApi = {
  async getExit(tabId: string): Promise<ExitCheck> {
    const r = await apiService.get<any>(`/bingo/garcom/saida/${tabId}`);
    return toExit(r.data);
  },

  async releaseExit(tabId: string): Promise<ExitCheck> {
    const r = await apiService.post<any>(`/bingo/garcom/saida/${tabId}/liberar`, {});
    return toExit(r.data);
  },

  /** Formas de pagamento ativas. */
  async getPaymentMethods(): Promise<WaiterPaymentMethod[]> {
    const r = await apiService.get<any>('/bingo/garcom/formas-pagamento');
    return asArray(r.data).map((m: any) => ({ id: n(m.id), name: String(m.name ?? '') }));
  },

  /** Contas nao pagas. Sem `all`, so as que pediram a conta; com `all`, todas as abertas. */
  async getBills(all = false): Promise<WaiterBill[]> {
    const r = await apiService.get<any>('/bingo/garcom/contas', all ? { todas: true } : undefined);
    return asArray(r.data).map((a: any) => ({
      tabId: a.tabId,
      mesa: n(a.mesa),
      customerName: a.customerName ?? '',
      status: a.status,
      phoneVerified: !!a.phoneVerified,
      total: n(a.total),
      amountDue: n(a.amountDue),
      undeliveredCount: n(a.undeliveredCount),
      contestedCount: n(a.contestedCount),
      items: asArray(a.items).map((i: any) => ({
        id: i.id,
        menuItemId: i.menuItemId,
        name: i.name ?? '',
        quantity: n(i.quantity),
        unitPrice: n(i.unitPrice),
        status: i.status,
        deliveredAt: i.deliveredAt ?? null,
        deliveredByName: i.deliveredByName ?? null,
        contestedAt: i.contestedAt ?? null,
        contestNote: i.contestNote ?? null,
        cancelledAt: i.cancelledAt ?? null,
        cancelledByName: i.cancelledByName ?? null,
        cancelReason: i.cancelReason ?? null,
      })),
    }));
  },

  cancelItem: (itemId: string, reason: string) =>
    apiService.post<any>(`/bingo/garcom/itens/${itemId}/cancelar`, { reason }),

  resolveContest: (itemId: string, action: ContestAction, note?: string) =>
    apiService.post<any>(`/bingo/garcom/itens/${itemId}/resolver-contestacao`, note ? { action, note } : { action }),

  payTabs: (tabIds: string[], paymentMethodId: number) =>
    apiService.post<any>('/bingo/garcom/comandas/pagar', { tabIds, paymentMethodId }),
};

export default bingoWaiterApi;
