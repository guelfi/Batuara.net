// Tipos compartilhados com o backend
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export enum UserRole {
  Admin = 0,
  Moderator = 1,
  Editor = 2,
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  type: EventType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum EventType {
  Festa = 0,
  Evento = 1,
  Celebracao = 2,
  Bazar = 3,
  Palestra = 4,
}

export interface CalendarAttendance {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: AttendanceType;
  description?: string;
  maxCapacity?: number;
  requiresRegistration: boolean;
  observations?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum AttendanceType {
  Kardecismo = 0,
  Umbanda = 1,
  Palestra = 2,
  Curso = 3,
}

export interface Orixa {
  id: string;
  name: string;
  description: string;
  origin: string;
  colors: string[];
  elements: string[];
  characteristics: string[];
  batuaraTeaching: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UmbandaLine {
  id: string;
  name: string;
  description: string;
  characteristics: string;
  entities: string[];
  workingDays: string[];
  batuaraInterpretation: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpiritualContent {
  id: string;
  title: string;
  content: string;
  type: SpiritualContentType;
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum SpiritualContentType {
  Prayer = 0,
  Teaching = 1,
  Study = 2,
  Meditation = 3,
}

export interface RevokeTokenRequest {
  refreshToken: string;
}

// Tipos específicos do dashboard
export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalAttendances: number;
  totalUsers: number;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  details?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface TableColumn {
  field: string;
  headerName: string;
  width?: number;
  flex?: number;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (params: any) => React.ReactNode;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'multiselect' | 'date' | 'time' | 'checkbox';
  required?: boolean;
  options?: { value: string | number; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | undefined;
  };
}