// Tipos baseados nos modelos de domínio da Casa Batuara

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: EventType;
  imageUrl?: string;
  location?: string;
  isActive: boolean;
}

export enum EventType {
  Festa = 1,
  Evento = 2,
  Bazar = 4,
  Palestra = 5,
}

export interface CalendarAttendance {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  type: AttendanceType;
  description?: string;
  observations?: string;
  requiresRegistration: boolean;
  maxCapacity?: number;
  isActive: boolean;
}

export enum AttendanceType {
  Kardecismo = 1,
  Umbanda = 2,
  Palestra = 3,
  Curso = 4,
}

export interface Orixa {
  id: number;
  name: string;
  description: string;
  origin: string;
  batuaraTeaching: string;
  imageUrl?: string;
  displayOrder: number;
  characteristics: string[];
  colors: string[];
  elements: string[];
  isActive: boolean;
}

export interface UmbandaLine {
  id: number;
  name: string;
  description: string;
  characteristics: string;
  batuaraInterpretation: string;
  displayOrder: number;
  entities: string[];
  workingDays: string[];
  isActive: boolean;
}

export interface SpiritualContent {
  id: number;
  title: string;
  content: string;
  type: SpiritualContentType;
  category: SpiritualCategory;
  source: string;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
}

export enum SpiritualContentType {
  Prayer = 1,
  Teaching = 2,
  Doctrine = 3,
  Hymn = 4,
  Ritual = 5,
}

export enum SpiritualCategory {
  Umbanda = 1,
  Kardecismo = 2,
  General = 3,
  Orixas = 4,
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  instagram: string;
  instagramUrl?: string;
  pixKey?: string;
}

// Tipos para navegação
export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
}

// Tipos para componentes
export interface PageSection {
  id: string;
  title: string;
  component: React.ComponentType;
}

// Tipos para API responses
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}