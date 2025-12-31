import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, PaginatedResponse } from '../types';

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: any[] = [];

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || '/batuara-api/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor para adicionar token de autenticação
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor para tratar erros globalmente
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Se o token expirou
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Se já estamos atualizando o token, enfileiramos a requisição
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              if (originalRequest) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.api(originalRequest);
              }
              return Promise.reject(new Error('Original request is undefined'));
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const newToken = response.data.data.token;

              // Atualizar token no localStorage
              localStorage.setItem('authToken', newToken);

              // Processar requisições pendentes
              this.processQueue(null, newToken);

              // Tentar novamente a requisição original
              if (originalRequest) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.api(originalRequest);
              }
            } else {
              throw new Error('No refresh token available');
            }
          } catch (refreshError) {
            // Se falhar ao atualizar o token, limpar dados e redirecionar para login
            this.processQueue(refreshError, null);
            this.clearAuthData();
            window.location.href = '/batuara-admin/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getRefreshToken(): string | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.refreshToken || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  private async refreshToken(refreshToken: string) {
    return this.post<ApiResponse<any>>('/auth/refresh', { refreshToken });
  }

  async logout() {
    return this.post<ApiResponse<any>>('/auth/logout');
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Métodos genéricos
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.delete(url);
    return response.data;
  }

  async getPaginated<T>(url: string, params?: any): Promise<PaginatedResponse<T>> {
    const response: AxiosResponse<PaginatedResponse<T>> = await this.api.get(url, { params });
    return response.data;
  }

  // Métodos para autenticação e usuário
  async getUserPreferences() {
    return this.get<ApiResponse<any>>('/auth/preferences');
  }

  async updateUserPreferences(data: any) {
    return this.put<ApiResponse<any>>('/auth/preferences', data);
  }

  // Métodos para eventos
  async getEvents(params?: any) {
    return this.getPaginated('/events', params);
  }

  async getEvent(id: string) {
    return this.get(`/events/${id}`);
  }

  async createEvent(data: any) {
    return this.post('/events', data);
  }

  async updateEvent(id: string, data: any) {
    return this.put(`/events/${id}`, data);
  }

  async deleteEvent(id: string) {
    return this.delete(`/events/${id}`);
  }

  // Métodos para calendário
  async getAttendances(params?: any) {
    return this.getPaginated('/calendar/attendances', params);
  }

  async getAttendance(id: string) {
    return this.get(`/calendar/attendances/${id}`);
  }

  async createAttendance(data: any) {
    return this.post('/calendar/attendances', data);
  }

  async updateAttendance(id: string, data: any) {
    return this.put(`/calendar/attendances/${id}`, data);
  }

  async deleteAttendance(id: string) {
    return this.delete(`/calendar/attendances/${id}`);
  }

  // Métodos para Orixás
  async getOrixas(params?: any) {
    return this.getPaginated('/orixas', params);
  }

  async getOrixa(id: string) {
    return this.get(`/orixas/${id}`);
  }

  async createOrixa(data: any) {
    return this.post('/orixas', data);
  }

  async updateOrixa(id: string, data: any) {
    return this.put(`/orixas/${id}`, data);
  }

  async deleteOrixa(id: string) {
    return this.delete(`/orixas/${id}`);
  }

  // Métodos para Linhas de Umbanda
  async getUmbandaLines(params?: any) {
    return this.getPaginated('/umbanda-lines', params);
  }

  async getUmbandaLine(id: string) {
    return this.get(`/umbanda-lines/${id}`);
  }

  async createUmbandaLine(data: any) {
    return this.post('/umbanda-lines', data);
  }

  async updateUmbandaLine(id: string, data: any) {
    return this.put(`/umbanda-lines/${id}`, data);
  }

  async deleteUmbandaLine(id: string) {
    return this.delete(`/umbanda-lines/${id}`);
  }

  // Métodos para conteúdo espiritual
  async getSpiritualContents(params?: any) {
    return this.getPaginated('/spiritual-contents', params);
  }

  async getSpiritualContent(id: string) {
    return this.get(`/spiritual-contents/${id}`);
  }

  async createSpiritualContent(data: any) {
    return this.post('/spiritual-contents', data);
  }

  async updateSpiritualContent(id: string, data: any) {
    return this.put(`/spiritual-contents/${id}`, data);
  }

  async deleteSpiritualContent(id: string) {
    return this.delete(`/spiritual-contents/${id}`);
  }

  // Métodos para dashboard
  async getDashboardStats() {
    return this.get('/dashboard/stats');
  }

  async getActivityLogs(params?: any) {
    return this.getPaginated('/dashboard/activity-logs', params);
  }
}

export const apiService = new ApiService();
export default apiService;
