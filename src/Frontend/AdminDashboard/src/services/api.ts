import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
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
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos genéricos
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    // Mock para desenvolvimento enquanto o backend não está disponível
    if (url === '/auth/verify') {
      return {
        success: true,
        data: null,
        message: 'Token válido'
      } as ApiResponse<T>;
    }

    if (url === '/auth/me') {
      return {
        success: true,
        data: {
          id: 1,
          name: 'Administrador',
          email: 'admin@casabatuara.org.br',
          role: 'admin',
          avatar: null
        } as unknown as T,
        message: 'Dados do usuário'
      };
    }

    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.get(url, { params });
      return response.data;
    } catch (error) {
      console.warn(`API não disponível para GET ${url}, retornando mock`);
      return {
        success: false,
        data: null,
        message: 'API não disponível'
      } as ApiResponse<T>;
    }
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
    try {
      const response: AxiosResponse<PaginatedResponse<T>> = await this.api.get(url, { params });
      return response.data;
    } catch (error) {
      console.warn(`API não disponível para getPaginated ${url}, retornando mock`);
      // Mock genérico para dados paginados
      return {
        data: [] as T[],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0
      };
    }
  }

  // Métodos específicos para autenticação com mock para desenvolvimento
  async login(email: string, password: string) {
    // Mock para desenvolvimento enquanto o backend não está disponível
    if (email === 'admin@casabatuara.org.br' && password === 'admin123') {
      return {
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: {
            id: 1,
            name: 'Administrador',
            email: 'admin@casabatuara.org.br',
            role: 'admin',
            avatar: null
          }
        },
        message: 'Login realizado com sucesso'
      };
    } else {
      // Simular erro de autenticação
      throw {
        response: {
          data: {
            success: false,
            message: 'Credenciais inválidas'
          }
        }
      };
    }
    // Código original comentado
    // return this.post('/auth/login', { email, password });
  }

  async logout() {
    // Mock para desenvolvimento
    return {
      success: true,
      message: 'Logout realizado com sucesso'
    };
    // Código original comentado
    // return this.post('/auth/logout');
  }

  async refreshToken() {
    // Mock para desenvolvimento
    return {
      success: true,
      data: {
        token: 'mock-jwt-token-refreshed'
      },
      message: 'Token atualizado com sucesso'
    };
    // Código original comentado
    // return this.post('/auth/refresh');
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
    // Mock para desenvolvimento
    return {
      success: true,
      data: {
        totalEvents: 24,
        upcomingEvents: 5,
        totalAttendances: 156,
        totalOrixas: 16,
        totalUmbandaLines: 7,
        totalSpiritualContents: 42,
        recentActivity: [
          { id: 1, type: 'event', action: 'create', user: 'Administrador', date: new Date().toISOString(), description: 'Criou evento Festa de Iemanjá' },
          { id: 2, type: 'attendance', action: 'update', user: 'Administrador', date: new Date().toISOString(), description: 'Atualizou horário de atendimento' },
          { id: 3, type: 'content', action: 'create', user: 'Administrador', date: new Date().toISOString(), description: 'Adicionou nova oração' }
        ]
      },
      message: 'Estatísticas do dashboard'
    };
    // return this.get('/dashboard/stats');
  }

  async getActivityLogs(params?: any) {
    // Mock para desenvolvimento
    const activityLogs = [
      { id: 1, type: 'event', action: 'create', user: 'Administrador', date: new Date().toISOString(), description: 'Criou evento Festa de Iemanjá' },
      { id: 2, type: 'attendance', action: 'update', user: 'Administrador', date: new Date().toISOString(), description: 'Atualizou horário de atendimento' },
      { id: 3, type: 'content', action: 'create', user: 'Administrador', date: new Date().toISOString(), description: 'Adicionou nova oração' },
      { id: 4, type: 'orixa', action: 'update', user: 'Administrador', date: new Date().toISOString(), description: 'Atualizou informações de Oxalá' },
      { id: 5, type: 'umbanda', action: 'create', user: 'Administrador', date: new Date().toISOString(), description: 'Adicionou nova linha de Umbanda' }
    ];

    return {
      data: activityLogs,
      totalCount: activityLogs.length,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1
    };
    // return this.getPaginated('/dashboard/activity-logs', params);
  }
}

export const apiService = new ApiService();
export default apiService;