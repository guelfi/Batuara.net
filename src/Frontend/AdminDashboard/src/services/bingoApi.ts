import apiService from './api';
import {
  BingoMenuItem,
  BingoEvent,
  BingoMenuItemInput,
  BingoPanel,
  BingoPaymentMethod,
  BingoSummary,
  BingoSummaryLine,
  BingoTab,
  BingoWaiter,
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

const normalizeTab = (t: any): BingoTab => {
  const items = asArray(t.items).map((i: any) => ({
    id: String(i.id),
    name: i.name ?? i.itemName ?? '',
    unitPrice: num(i.unitPrice),
    quantity: num(i.quantity, 1),
    status: (i.status === 1 || i.status === 'Delivered' ? 'Delivered' : 'Pending') as 'Pending' | 'Delivered',
    createdAt: i.createdAt,
  }));
  const status: BingoTab['status'] =
    t.status === 'Paid' || t.status === 2 ? 'Paid'
      : t.status === 'CloseRequested' || t.status === 1 ? 'CloseRequested' : 'Open';
  const total = pick(t, 'total', 'totalAmount');
  return {
    tabId: String(pick(t, 'tabId', 'id')),
    mesa: pick(t, 'mesa', 'tableNumber') ?? '-',
    customerName: t.customerName ?? '',
    status,
    total: total !== undefined ? num(total) : items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    paymentMethod: t.paymentMethod ?? null,
    items,
  };
};

const normalizeLines = (v: any, labelKeys: string[]): BingoSummaryLine[] => {
  if (Array.isArray(v)) {
    return v.map((l: any) => {
      const q = pick(l, 'quantity', 'quantidade', 'count');
      return {
        label: String(pick(l, ...labelKeys) ?? '-'),
        quantity: q !== undefined ? num(q) : undefined,
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
  openEvent: (id: string) => apiService.post<any>(`${BASE}/eventos/${id}/abrir`),
  closeEvent: (id: string) => apiService.post<any>(`${BASE}/eventos/${id}/encerrar`),

  async getEventTabs(id: string): Promise<BingoTab[]> {
    const r = await apiService.get<any>(`${BASE}/eventos/${id}/comandas`);
    return asArray(Array.isArray(r.data) ? r.data : pick(r.data, 'comandas', 'tabs')).map(normalizeTab);
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
    return {
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

  async getSummary(eventoId?: string): Promise<BingoSummary> {
    const r = await apiService.get<any>(`${BASE}/resumo`, eventoId ? { eventoId } : undefined);
    return normalizeSummary(r.data);
  },

  payTab: (tabId: string, method: BingoPaymentMethod) =>
    apiService.post<any>(`${BASE}/comandas/${tabId}/pagar`, { method }),

  resetEvent: () => apiService.post<any>(`${BASE}/zerar-evento`, { confirmar: true }),
};

export default bingoApi;
