import apiService from './api';
import { WaiterTableStatus } from '../types/bingoWaiter';
import {
  BingoMenuItem,
  BingoEvent,
  BingoMenuItemInput,
  BingoPanel,
  BingoPaymentMethod,
  BingoPayMethod,
  BingoPayMethodInput,
  BingoSummary,
  BingoSummaryLine,
  BingoTab,
  BingoTableSetting,
  BingoWaiter,
  BingoOrderItem,
  WaiterAccount,
  WaiterOrderGroup,
  WaiterStatus,
  BingoReminderPreview,
  BingoReminderResult,
} from '../types/bingo';

/**
 * Chamadas do módulo Bingo (rotas em docs/BINGO-CONTRATO.md, seção Admin).
 * Usa o apiService (cookies/withCredentials, refresh automático).
 * Os formatos de painel/resumo/garçons não estão detalhados no contrato, então
 * os normalizadores abaixo aceitam variações comuns de nomes de campos.
 */
const BASE = '/bingo/admin';

const num = (v: any, fallback = 0): number => {
  const n = typeof v === 'string' ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : fallback;
};

const asArray = (v: any): any[] => (Array.isArray(v) ? v : []);

const pick = (o: any, ...keys: string[]) => {
  for (const k of keys) {
    if (o && o[k] !== undefined && o[k] !== null) return o[k];
  }
  return undefined;
};

const ITEM_STATUS: BingoOrderItem['status'][] = ['Pending', 'Retrieved', 'Delivered', 'Contested', 'Cancelled'];
const normalizeItemStatus = (st: any): BingoOrderItem['status'] => {
  if (typeof st === 'string' && (ITEM_STATUS as string[]).includes(st)) return st as BingoOrderItem['status'];
  if (typeof st === 'number' && ITEM_STATUS[st]) return ITEM_STATUS[st];
  return 'Pending';
};

const normalizeItem = (i: any): BingoOrderItem => ({
  id: String(i.id),
  menuItemId: i.menuItemId != null ? String(i.menuItemId) : null,
  name: i.name ?? i.itemName ?? '',
  unitPrice: num(i.unitPrice),
  quantity: num(i.quantity, 1),
  status: normalizeItemStatus(i.status),
  createdAt: i.createdAt,
  deliveredAt: i.deliveredAt ?? null,
  deliveredByName: i.deliveredByName ?? null,
  retrievedByName: i.retrievedByName ?? null,
  contestedAt: i.contestedAt ?? null,
  contestNote: i.contestNote ?? null,
  cancelledAt: i.cancelledAt ?? null,
  cancelledByName: i.cancelledByName ?? null,
  cancelReason: i.cancelReason ?? null,
});

const normalizeTab = (t: any): BingoTab => {
  const items = asArray(t.items).map(normalizeItem);
  const status: BingoTab['status'] =
    t.status === 'Paid' || t.status === 2 ? 'Paid'
      : t.status === 'CloseRequested' || t.status === 1 ? 'CloseRequested' : 'Open';
  const total = pick(t, 'total', 'totalAmount');
  const active = items.filter((i) => i.status !== 'Cancelled');
  const sumTotal = active.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const amountDue = pick(t, 'amountDue');
  const undelivered = pick(t, 'undeliveredCount');
  const contested = pick(t, 'contestedCount');
  return {
    tabId: String(pick(t, 'tabId', 'id')),
    mesa: pick(t, 'mesa', 'tableNumber') ?? '-',
    customerName: t.customerName ?? '',
    status,
    total: total !== undefined ? num(total) : sumTotal,
    amountDue: amountDue !== undefined ? num(amountDue)
      : items.filter((i) => i.status === 'Delivered').reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    undeliveredCount: undelivered !== undefined ? num(undelivered)
      : items.filter((i) => i.status === 'Pending' || i.status === 'Retrieved').length,
    contestedCount: contested !== undefined ? num(contested) : items.filter((i) => i.status === 'Contested').length,
    paymentMethod: t.paymentMethod ?? null,
    paidByName: t.paidByName ?? null,
    paidAt: t.paidAt ?? null,
    items,
    phoneVerified: t.phoneVerified === undefined || t.phoneVerified === null ? undefined : !!t.phoneVerified,
    codeDeliveryStatus: t.codeDeliveryStatus ?? null,
    codeDeliveryError: t.codeDeliveryError ?? null,
    reminderSentAt: t.reminderSentAt ?? null,
    reminderDeliveryStatus: t.reminderDeliveryStatus ?? null,
  };
};

const normalizePayMethod = (m: any): BingoPayMethod => ({
  id: num(m.id),
  name: m.name ?? '',
  isActive: m.isActive === undefined ? true : !!m.isActive,
  sortOrder: num(m.sortOrder),
});

const normalizeLines = (v: any, labelKeys: string[]): BingoSummaryLine[] => {
  if (Array.isArray(v)) {
    return v.map((l: any) => {
      const q = pick(l, 'quantity', 'quantidade', 'count');
      return {
        label: String(pick(l, ...labelKeys) ?? '-'),
        quantity: q !== undefined ? num(q) : undefined,
        count: l.count !== undefined ? num(l.count) : undefined,
        total: num(pick(l, 'total', 'value', 'valor', 'amount')),
      };
    });
  }
  if (v && typeof v === 'object') {
    return Object.entries(v).map(([label, total]) => ({ label, total: num(total) }));
  }
  return [];
};

const normalizeEvent = (e: any): BingoEvent => {
  const st = e.status;
  const status: BingoEvent['status'] =
    st === 'Open' || st === 'Aberto' || st === 1 ? 'Open'
      : st === 'Suspended' || st === 'Suspenso' || st === 3 ? 'Suspended'
      : st === 'Closed' || st === 'Encerrado' || st === 2 ? 'Closed' : 'Draft';
  return {
    id: String(e.id),
    name: e.name ?? '',
    eventDate: e.eventDate ?? '',
    status,
    isTest: !!e.isTest,
    closeAllRequested: !!e.closeAllRequested,
    totalSold: num(e.totalSold),
  };
};

const normalizeSummary = (d: any): BingoSummary => {
  d = d ?? {};
  return {
    totalSold: num(pick(d, 'totalSold', 'totalVendido', 'totalPaid')),
    totalOpen: num(pick(d, 'totalOpen', 'totalEmAberto', 'emAberto')),
    byPayment: normalizeLines(
      pick(d, 'byPaymentMethod', 'porFormaPagamento', 'byPayment', 'porFormaDePagamento'),
      ['method', 'paymentMethod', 'formaPagamento', 'label'],
    ),
    byItem: normalizeLines(pick(d, 'byItem', 'porItem', 'items'), ['name', 'itemName', 'item', 'label']),
    cancelledTotal: num(d.cancelledTotal),
    contestedOpen: num(d.contestedOpen),
    photoCount: num(d.photoCount),
    photoTotal: num(d.photoTotal),
    photoUnmatched: num(d.photoUnmatched),
    grandTotal: d.grandTotal !== undefined ? num(d.grandTotal) : num(pick(d, 'totalSold', 'totalVendido', 'totalPaid')),
    byWaiter: asArray(d.byWaiter).map((w: any) => ({
      name: w.name ?? '-',
      count: num(w.count),
      total: num(w.total),
      byMethod: asArray(w.byMethod).map((m: any) => ({ method: String(m.method ?? '-'), total: num(m.total) })),
    })),
  };
};

export const bingoApi = {
  // Eventos (multi-evento com histórico)
  async getEvents(): Promise<BingoEvent[]> {
    const r = await apiService.get<any>(`${BASE}/eventos`);
    return asArray(r.data).map(normalizeEvent);
  },

  createEvent: (data: { name: string; eventDate: string; copiarDeEventoId?: string }) =>
    apiService.post<any>(`${BASE}/eventos`, data),
  updateEvent: (id: string, data: { name: string; eventDate: string }) =>
    apiService.put<any>(`${BASE}/eventos/${id}`, data),
  openEvent: (id: string) => apiService.post<any>(`${BASE}/eventos/${id}/abrir`),
  reopenEvent: (id: string) => apiService.post<any>(`${BASE}/eventos/${id}/reabrir`),
  suspendEvent: (id: string) => apiService.post<any>(`${BASE}/eventos/${id}/suspender`),
  cancelEvent: (id: string) => apiService.post<any>(`${BASE}/eventos/${id}/cancelar`),
  resumeEvent: (id: string) => apiService.post<any>(`${BASE}/eventos/${id}/retomar`),
  closeEvent: (id: string) => apiService.post<any>(`${BASE}/eventos/${id}/encerrar`),

  async getEventTabs(id: string): Promise<BingoTab[]> {
    const r = await apiService.get<any>(`${BASE}/eventos/${id}/comandas`);
    return asArray(Array.isArray(r.data) ? r.data : pick(r.data, 'comandas', 'tabs')).map(normalizeTab);
  },

  async getReminderPreview(id: string): Promise<BingoReminderPreview> {
    const r = await apiService.get<any>(`${BASE}/eventos/${id}/lembretes/previa`);
    const d = r.data ?? {};
    return {
      count: num(d.count),
      totalOwed: num(d.totalOwed),
      items: asArray(d.items).map((i: any) => ({
        tabId: String(i.tabId),
        customerName: i.customerName ?? '',
        mesa: i.mesa ?? '-',
        total: num(i.total),
        reminderSentAt: i.reminderSentAt ?? null,
      })),
    };
  },

  async sendReminders(id: string): Promise<BingoReminderResult> {
    const r = await apiService.post<any>(`${BASE}/eventos/${id}/lembretes/enviar`, { confirmar: true });
    const d = r.data ?? {};
    return { sent: num(d.sent), skipped: num(d.skipped), failed: num(d.failed) };
  },

  async getEventSummary(id: string): Promise<BingoSummary> {
    const r = await apiService.get<any>(`${BASE}/eventos/${id}/resumo`);
    return normalizeSummary(r.data);
  },

  /** closeAllRequested agora é por evento; sem eventoId = evento atual. */
  setCloseAll: (closeAllRequested: boolean) => apiService.put<any>(`${BASE}/settings`, { closeAllRequested }),

  async getPanel(): Promise<BingoPanel> {
    const r = await apiService.get<any>(`${BASE}/painel`);
    const d = r.data ?? {};
    const tabs = asArray(pick(d, 'comandas', 'tabs')).map(normalizeTab);
    const sold = pick(d, 'totalSold', 'totalVendido');
    const retrieved = d.counts?.retrievedItems;
    return {
      retrievedItems: retrieved !== undefined && retrieved !== null ? num(retrieved) : undefined,
      phoneVerifiedCount: d.counts?.phoneVerified !== undefined ? num(d.counts.phoneVerified) : undefined,
      phoneNotVerifiedCount: d.counts?.phoneNotVerified !== undefined ? num(d.counts.phoneNotVerified) : undefined,
      codeDeliveryFailedCount: d.counts?.codeDeliveryFailed !== undefined ? num(d.counts.codeDeliveryFailed) : undefined,
      contestedItems: d.counts?.contestedItems !== undefined ? num(d.counts.contestedItems) : undefined,
      cancelledItems: d.counts?.cancelledItems !== undefined ? num(d.counts.cancelledItems) : undefined,
      closeAllRequested: pick(d, 'closeAllRequested'),
      totalSold: sold !== undefined ? num(sold) : undefined,
      tabs,
    };
  },

  async getMenu(): Promise<BingoMenuItem[]> {
    const r = await apiService.get<any>(`${BASE}/menu`);
    return asArray(r.data).map((m: any) => ({
      id: String(m.id),
      name: m.name ?? '',
      unitPrice: num(m.unitPrice),
      isAvailable: !!m.isAvailable,
      sortOrder: num(m.sortOrder),
      isUsed: !!m.isUsed,
    }));
  },

  createMenuItem: (data: BingoMenuItemInput) => apiService.post<any>(`${BASE}/menu`, data),
  updateMenuItem: (id: string, data: BingoMenuItemInput) => apiService.put<any>(`${BASE}/menu/${id}`, data),
  deleteMenuItem: (id: string) => apiService.delete<any>(`${BASE}/menu/${id}`),
  setAvailability: (id: string, isAvailable: boolean) =>
    apiService.patch<any>(`${BASE}/menu/${id}/disponibilidade`, { isAvailable }),

  async getTableCount(): Promise<number> {
    const r = await apiService.get<any>(`${BASE}/mesas`);
    const d = r.data;
    if (Array.isArray(d)) {
      const nums = d.map((x: any) => num(typeof x === 'object' ? pick(x, 'numero', 'number') : x));
      return nums.length ? Math.max(...nums) : 0;
    }
    if (d && typeof d === 'object') {
      const q = pick(d, 'quantidade', 'count');
      if (q !== undefined) return num(q);
      return asArray(pick(d, 'mesas', 'tables')).length;
    }
    return 0;
  },

  setTableCount: (quantidade: number) => apiService.put<any>(`${BASE}/mesas`, { quantidade }),

  /** Lugares e exclusividade de cada mesa do evento. */
  async getTableSettings(): Promise<BingoTableSetting[]> {
    const r = await apiService.get<any>(`${BASE}/mesas`);
    return asArray(r.data?.detalhes).map((m: any) => ({ numero: num(m.numero), lugares: num(m.lugares) || 4, exclusiva: !!m.exclusiva }));
  },

  async updateTableSettings(mesas: BingoTableSetting[]): Promise<BingoTableSetting[]> {
    const r = await apiService.put<any>(`${BASE}/mesas/configuracao`, { mesas });
    return asArray(r.data?.detalhes).map((m: any) => ({ numero: num(m.numero), lugares: num(m.lugares) || 4, exclusiva: !!m.exclusiva }));
  },

  async getWaiters(): Promise<BingoWaiter[]> {
    const r = await apiService.get<any>(`${BASE}/garcons`);
    return asArray(r.data).map((w: any) => ({
      houseMemberId: pick(w, 'houseMemberId', 'id'),
      name: pick(w, 'name', 'fullName', 'nome') ?? '',
      lastSeenAt: w.lastSeenAt ?? null,
      deliveries: num(pick(w, 'deliveries', 'entregas', 'deliveredCount', 'deliveriesCount')),
    }));
  },

  addWaiter: (houseMemberId: string | number) => apiService.post<any>(`${BASE}/garcons`, { houseMemberId }),
  removeWaiter: (houseMemberId: string | number) => apiService.delete<any>(`${BASE}/garcons/${houseMemberId}`),
  endWaiterSessions: () => apiService.post<any>(`${BASE}/garcons/encerrar-sessoes`),

  // ---- Garçom (autenticado pelo cookie da sessão do filho) ----
  /** Link assinado do QR da mesa (abre a comanda com a mesa travada para o cliente). */
  async getMesaQrUrl(mesa: number): Promise<string> {
    const r = await apiService.get<any>(`/bingo/garcom/mesas/${mesa}/qr`);
    const d: any = r.data?.data ?? r.data ?? {};
    return String(d.url ?? '');
  },
  async getWaiterStatus(): Promise<WaiterStatus> {
    const r = await apiService.get<WaiterStatus>('/bingo/garcom/me');
    const d: any = r.data ?? {};
    return { isWaiter: !!d.isWaiter, eventOpen: !!d.eventOpen, eventName: d.eventName ?? null, waiterName: d.waiterName ?? null };
  },

  /** Situação de cada mesa: lugares, quem está nela e se há vaga (só informa). */
  async getWaiterTablesStatus(): Promise<WaiterTableStatus[]> {
    const r = await apiService.get<any>('/bingo/garcom/mesas/status');
    const states = ['Free', 'HasSeats', 'Full', 'ExclusiveTaken'];
    return asArray(r.data).map((t: any) => ({
      numero: num(t.numero),
      lugares: num(t.lugares),
      exclusiva: !!t.exclusiva,
      ocupados: num(t.ocupados),
      livres: num(t.livres),
      comandas: num(t.comandas),
      estado: (states.includes(t.estado) ? t.estado : 'Free') as WaiterTableStatus['estado'],
      ocupantes: asArray(t.ocupantes).map((o: any) => ({ nome: String(o.nome ?? ''), pessoas: num(o.pessoas) || 1 })),
    }));
  },

  async getWaiterTables(): Promise<number[]> {
    const r = await apiService.get<any>('/bingo/public/info');
    return asArray(r.data?.mesas).map((n: any) => num(n)).filter((n: number) => n > 0);
  },

  async getWaiterOrders(): Promise<WaiterOrderGroup[]> {
    const r = await apiService.get<WaiterOrderGroup[]>('/bingo/garcom/pedidos');
    return asArray(r.data).map((g: any) => ({
      ...g,
      items: asArray(g.items).map((i: any) => ({
        ...i,
        status: i.status === 'Retrieved' ? 'Retrieved' : 'Pending',
        retrievedByName: i.retrievedByName ?? null,
        retrievedByMe: !!i.retrievedByMe,
      })),
    }));
  },

  retrieveItem: (itemId: string) => apiService.post<any>(`/bingo/garcom/itens/${itemId}/retirar`),

  returnItem: (itemId: string) => apiService.post<any>(`/bingo/garcom/itens/${itemId}/devolver`),

  deliverItem: (itemId: string) => apiService.post<any>(`/bingo/garcom/itens/${itemId}/entregar`),

  changeTabTable: (tabId: string, mesa: number) =>
    apiService.post<any>(`/bingo/garcom/comandas/${tabId}/mesa`, { mesa }),

  async getWaiterAccounts(): Promise<WaiterAccount[]> {
    const r = await apiService.get<WaiterAccount[]>('/bingo/garcom/contas');
    return asArray(r.data);
  },

  payTabs: (tabIds: string[], method: BingoPaymentMethod) =>
    apiService.post<any>('/bingo/garcom/comandas/pagar', { tabIds, method }),

  async getSummary(eventoId?: string): Promise<BingoSummary> {
    const r = await apiService.get<any>(`${BASE}/resumo`, eventoId ? { eventoId } : undefined);
    return normalizeSummary(r.data);
  },

  // ---- Formas de pagamento ----
  async getPaymentMethods(): Promise<BingoPayMethod[]> {
    const r = await apiService.get<any>(`${BASE}/formas-pagamento`);
    return asArray(r.data).map(normalizePayMethod).sort((a, b) => a.sortOrder - b.sortOrder);
  },
  createPaymentMethod: (data: BingoPayMethodInput) => apiService.post<any>(`${BASE}/formas-pagamento`, data),
  updatePaymentMethod: (id: number, data: BingoPayMethodInput) =>
    apiService.put<any>(`${BASE}/formas-pagamento/${id}`, data),
  deletePaymentMethod: (id: number) => apiService.delete<any>(`${BASE}/formas-pagamento/${id}`),

  // ---- Fechamento no caixa ----
  async getTableTabs(mesa: number | string): Promise<BingoTab[]> {
    const r = await apiService.get<any>(`${BASE}/mesas/${mesa}/comandas`);
    return asArray(Array.isArray(r.data) ? r.data : pick(r.data, 'comandas', 'tabs')).map(normalizeTab);
  },
  cancelTab: (tabId: string, reason: string) =>
    apiService.post<any>(`${BASE}/comandas/${tabId}/cancelar`, { reason }),
  cancelPhotoTab: (id: number, reason: string) =>
    apiService.post<any>(`${BASE}/comandas-foto/${id}/cancelar`, { reason }),
  cancelItem: (itemId: string, reason: string) =>
    apiService.post<any>(`${BASE}/itens/${itemId}/cancelar`, { reason }),
  resolveContest: (itemId: string, action: 'ConfirmDelivered' | 'Cancel', note?: string) =>
    apiService.post<any>(`${BASE}/itens/${itemId}/resolver-contestacao`, { action, ...(note ? { note } : {}) }),
  deliverItemAdmin: (itemId: string) => apiService.post<any>(`${BASE}/itens/${itemId}/entregar`),
  async payTabsAdmin(tabIds: string[], paymentMethodId: number | null, note?: string, payments?: { paymentMethodId: number | null; amount: number }[]): Promise<{ paidCount: number; total: number }> {
    const r = await apiService.post<any>(`${BASE}/comandas/pagar`, { tabIds, ...(paymentMethodId !== null ? { paymentMethodId } : {}), ...(payments ? { payments } : {}), ...(note ? { note } : {}) });
    return { paidCount: num(r.data?.paidCount), total: num(r.data?.total) };
  },

  resetEvent: () => apiService.post<any>(`${BASE}/zerar-evento`, { confirmar: true }),
};

export default bingoApi;
