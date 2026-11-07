import axios from 'axios';
import { resolveBaseUrl } from './api';
import { ApiResponse } from '../types';
import {
  BingoOrderLine,
  BingoPaymentMethod,
  BingoPublicInfo,
  BingoTabView,
  CreateBingoTabRequest,
  CreateBingoTabResponse,
  WaiterAccount,
  WaiterLoginResponse,
  WaiterOrderGroup,
} from '../types/bingo';

const http = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 10000,
});

const WAITER_TOKEN_KEY = 'bingo_waiter_token';
const WAITER_NAME_KEY = 'bingo_waiter_name';
const TAB_ID_KEY = 'bingo_tab_id';

const safeStorage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* ignora */
    }
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignora */
    }
  },
};

export const savedTabId = {
  get: () => safeStorage.get(TAB_ID_KEY),
  set: (id: string) => safeStorage.set(TAB_ID_KEY, id),
  clear: () => safeStorage.remove(TAB_ID_KEY),
};

export const waiterSession = {
  getToken: () => safeStorage.get(WAITER_TOKEN_KEY),
  getName: () => safeStorage.get(WAITER_NAME_KEY),
  save(r: WaiterLoginResponse) {
    safeStorage.set(WAITER_TOKEN_KEY, r.token);
    safeStorage.set(WAITER_NAME_KEY, r.name);
  },
  clear() {
    safeStorage.remove(WAITER_TOKEN_KEY);
    safeStorage.remove(WAITER_NAME_KEY);
  },
};

/** Extrai a mensagem de erro da API ou devolve um texto padrão. */
export const apiErrorMessage = (error: any, fallback = 'Não foi possível concluir. Tente novamente.'): string => {
  const data = error?.response?.data;
  if (data?.message && typeof data.message === 'string') return data.message;
  if (Array.isArray(data?.errors) && data.errors.length) {
    const first = data.errors[0];
    return typeof first === 'string' ? first : first?.message || fallback;
  }
  return fallback;
};

export const httpStatus = (error: any): number | undefined => error?.response?.status;

const waiterHeaders = () => ({ Authorization: `Bearer ${waiterSession.getToken() ?? ''}` });

export const bingoApi = {
  async getInfo(): Promise<BingoPublicInfo> {
    const r = await http.get<ApiResponse<BingoPublicInfo>>('/bingo/public/info');
    return r.data.data;
  },

  async createTab(body: CreateBingoTabRequest): Promise<CreateBingoTabResponse> {
    const r = await http.post<ApiResponse<CreateBingoTabResponse>>('/bingo/public/comandas', body);
    return r.data.data;
  },

  async getTab(tabId: string): Promise<BingoTabView> {
    const r = await http.get<ApiResponse<BingoTabView>>(`/bingo/public/comandas/${tabId}`);
    return r.data.data;
  },

  async addItems(tabId: string, items: BingoOrderLine[]): Promise<void> {
    await http.post(`/bingo/public/comandas/${tabId}/itens`, { items });
  },

  async closeTab(tabId: string): Promise<void> {
    await http.post(`/bingo/public/comandas/${tabId}/encerrar`);
  },

  async resendLink(tabId: string): Promise<void> {
    await http.post(`/bingo/public/comandas/${tabId}/reenviar-link`);
  },

  // ---- Garçom ----
  async waiterRequestCode(phone: string): Promise<void> {
    await http.post('/member-auth/request-code', { mobilePhone: phone });
  },

  async waiterVerifyCode(phone: string, code: string): Promise<WaiterLoginResponse> {
    const r = await http.post<ApiResponse<WaiterLoginResponse>>('/bingo/garcom/verify-code', { phone, code });
    return r.data.data;
  },

  async waiterOrders(): Promise<WaiterOrderGroup[]> {
    const r = await http.get<ApiResponse<WaiterOrderGroup[]>>('/bingo/garcom/pedidos', { headers: waiterHeaders() });
    return r.data.data;
  },

  async waiterDeliver(itemId: string): Promise<void> {
    await http.post(`/bingo/garcom/itens/${itemId}/entregar`, undefined, { headers: waiterHeaders() });
  },

  async waiterChangeTable(tabId: string, mesa: number): Promise<void> {
    await http.post(`/bingo/garcom/comandas/${tabId}/mesa`, { mesa }, { headers: waiterHeaders() });
  },

  async waiterAccounts(): Promise<WaiterAccount[]> {
    const r = await http.get<ApiResponse<WaiterAccount[]>>('/bingo/garcom/contas', { headers: waiterHeaders() });
    return r.data.data;
  },

  async waiterPay(tabIds: string[], method: BingoPaymentMethod): Promise<void> {
    await http.post('/bingo/garcom/comandas/pagar', { tabIds, method }, { headers: waiterHeaders() });
  },
};
