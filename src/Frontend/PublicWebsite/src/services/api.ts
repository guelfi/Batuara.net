import axios from 'axios';
import {
  ApiResponse,
  CalendarAttendance,
  CreateContactMessageRequest,
  Event,
  Guide,
  Orixa,
  PaginatedResponse,
  SiteSettingsDto,
  SpiritualContent,
  UmbandaLine,
} from '../types';

const resolveBaseUrl = (): string => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl && envUrl.trim()) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    if (trimmed.endsWith('/batuara-api')) {
      return `${trimmed}/api`;
    }

    return trimmed;
  }

  const isDev = process.env.NODE_ENV === 'development';
  const isBrowser = typeof window !== 'undefined';
  const host = isBrowser ? window.location.hostname : '';
  const port = isBrowser ? window.location.port : '';

  if (isDev && isBrowser) {
    if (port === '3000' || port === '3001') {
      return `${window.location.protocol}//${host}/batuara-api/api`;
    }
    return `${window.location.protocol}//${host}/batuara-api/api`;
  }

  return '/batuara-api/api';
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 10000,
});

const shouldLog = () => process.env.NODE_ENV === 'development';

api.interceptors.request.use(
  (config) => {
    (config as any).metadata = { startTime: Date.now() };
    if (shouldLog()) {
      const baseURL = config.baseURL || api.defaults.baseURL || '';
      const url = config.url || '';
      const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;
      console.log('[Public API]', (config.method || 'get').toUpperCase(), fullUrl);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (shouldLog()) {
      const start = (response.config as any)?.metadata?.startTime;
      const elapsedMs = typeof start === 'number' ? Date.now() - start : undefined;
      const baseURL = response.config.baseURL || api.defaults.baseURL || '';
      const url = response.config.url || '';
      const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;
      console.log('[Public API]', (response.config.method || 'get').toUpperCase(), fullUrl, response.status, elapsedMs != null ? `${elapsedMs}ms` : '');
    }
    return response;
  },
  (error) => {
    if (shouldLog()) {
      const status = error?.response?.status;
      const url = error?.config?.url;
      const baseURL = error?.config?.baseURL || api.defaults.baseURL || '';
      const fullUrl = typeof url === 'string' ? (url.startsWith('http') ? url : `${baseURL}${url}`) : '';
      const start = error?.config?.metadata?.startTime;
      const elapsedMs = typeof start === 'number' ? Date.now() - start : undefined;
      const apiMessage = error?.response?.data?.message;
      console.warn('[Public API]', (error?.config?.method || 'get').toUpperCase(), fullUrl, status, elapsedMs != null ? `${elapsedMs}ms` : '', apiMessage || error?.message);
    }
    return Promise.reject(error);
  }
);

export const publicApi = {
  async getSiteSettings() {
    const response = await api.get<ApiResponse<SiteSettingsDto>>('/site-settings/public');
    return response.data.data;
  },

  async getCalendarAttendances(params?: Record<string, unknown>) {
    const response = await api.get<ApiResponse<PaginatedResponse<CalendarAttendance>>>('/public/calendar/attendances', { params });
    return response.data.data;
  },

  async getEvents(params?: Record<string, unknown>) {
    const response = await api.get<ApiResponse<PaginatedResponse<Event>>>('/public/events', { params });
    return response.data.data;
  },

  async getOrixas(params?: Record<string, unknown>) {
    const response = await api.get<ApiResponse<Orixa[]>>('/public/orixas', { params });
    return response.data.data;
  },

  async getUmbandaLines(params?: Record<string, unknown>) {
    const response = await api.get<ApiResponse<PaginatedResponse<UmbandaLine>>>('/public/umbanda-lines', { params });
    return response.data.data;
  },

  async getSpiritualContents(params?: Record<string, unknown>) {
    const response = await api.get<ApiResponse<PaginatedResponse<SpiritualContent>>>('/public/spiritual-contents', { params });
    return response.data.data;
  },

  async createContactMessage(data: CreateContactMessageRequest) {
    const response = await api.post<ApiResponse<{ id: number }>>('/public/contact-messages', data);
    return response.data;
  },

  async getGuides(params?: Record<string, unknown>) {
    const response = await api.get<ApiResponse<Guide[]>>('/public/guides', { params });
    return response.data.data;
  },
};

export default publicApi;
