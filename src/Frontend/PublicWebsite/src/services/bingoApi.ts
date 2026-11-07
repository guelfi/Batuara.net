import axios from 'axios';
import { resolveBaseUrl } from './api';
import { ApiResponse } from '../types';
import {
  BingoOrderLine,
  BingoPublicInfo,
  BingoTabView,
  BingoUndeliveredItem,
  CreateBingoTabRequest,
  CreateBingoTabResponse,
} from '../types/bingo';

const http = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 10000,
});

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

const PROFILE_KEY = 'bingo_profile';

/** Nome e celular do cliente neste aparelho, para reabrir comanda so escolhendo a mesa. */
export const savedProfile = {
  get: (): { name: string; phone: string } | null => {
    try {
      const raw = safeStorage.get(PROFILE_KEY);
      if (!raw) return null;
      const v = JSON.parse(raw);
      return typeof v?.name === 'string' && typeof v?.phone === 'string' && v.name && v.phone ? { name: v.name, phone: v.phone } : null;
    } catch {
      return null;
    }
  },
  set: (name: string, phone: string) => safeStorage.set(PROFILE_KEY, JSON.stringify({ name, phone })),
  clear: () => safeStorage.remove(PROFILE_KEY),
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

/** Itens ainda nao entregues quando o encerramento e recusado (409 UNDELIVERED_ITEMS). */
export const undeliveredFromError = (error: any): BingoUndeliveredItem[] | null => {
  if (error?.response?.status !== 409 || error?.response?.data?.code !== 'UNDELIVERED_ITEMS') return null;
  const items = error.response.data?.data?.items;
  return Array.isArray(items) ? items : [];
};

export const httpStatus = (error: any): number | undefined => error?.response?.status;

export const bingoApi = {
  async getInfo(): Promise<BingoPublicInfo> {
    const r = await http.get<ApiResponse<BingoPublicInfo>>('/bingo/public/info');
    return r.data.data;
  },

  async createTab(body: CreateBingoTabRequest): Promise<CreateBingoTabResponse> {
    const r = await http.post<ApiResponse<CreateBingoTabResponse>>('/bingo/public/comandas', body);
    return r.data.data;
  },

  /** Nova comanda a partir de uma anterior: reaproveita nome e celular no servidor; so informa a mesa. */
  async reopenTab(tabId: string, mesa: number): Promise<CreateBingoTabResponse> {
    const r = await http.post<ApiResponse<CreateBingoTabResponse>>(`/bingo/public/comandas/${tabId}/nova`, { mesa });
    return r.data.data;
  },

  async getTab(tabId: string): Promise<BingoTabView> {
    const r = await http.get<ApiResponse<BingoTabView>>(`/bingo/public/comandas/${tabId}`);
    return r.data.data;
  },

  async addItems(tabId: string, items: BingoOrderLine[]): Promise<void> {
    await http.post(`/bingo/public/comandas/${tabId}/itens`, { items });
  },

  async closeTab(tabId: string, cancelUndelivered = false): Promise<void> {
    await http.post(`/bingo/public/comandas/${tabId}/encerrar`, cancelUndelivered ? { cancelUndelivered: true } : {});
  },

  async cancelClose(tabId: string): Promise<void> {
    await http.post(`/bingo/public/comandas/${tabId}/reabrir`, {});
  },

  async contestItem(tabId: string, itemId: string, note?: string): Promise<void> {
    await http.post(`/bingo/public/comandas/${tabId}/itens/${itemId}/contestar`, note ? { note } : {});
  },

  async confirmPhone(tabId: string, code: string): Promise<void> {
    await http.post(`/bingo/public/comandas/${tabId}/confirmar-celular`, { code });
  },

  async resendCode(tabId: string): Promise<void> {
    await http.post(`/bingo/public/comandas/${tabId}/reenviar-codigo`);
  },
};
