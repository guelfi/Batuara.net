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
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalhost = host === 'localhost' || host === '127.0.0.1';

  if (isDev && isLocalhost) {
    return 'http://localhost:3003/batuara-api/api';
  }

  return '/batuara-api/api';
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 10000,
});

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
