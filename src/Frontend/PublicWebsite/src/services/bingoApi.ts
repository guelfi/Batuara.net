import axios from 'axios';
import { resolveBaseUrl } from './api';
import { ApiResponse } from '../types';
import {
  BingoOrderLine,
  BingoPublicInfo,
  BingoTabView,
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
};
