import apiService from './api';
import { ContestAction, WaiterBill, WaiterPaymentMethod } from '../types/bingoWaiter';

const asArray = (v: any): any[] => (Array.isArray(v) ? v : []);
const n = (v: any): number => (typeof v === 'number' ? v : Number(v) || 0);

const bingoWaiterApi = {
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
