// Tipos baseados nos modelos de domínio da Casa Batuara

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: EventType | keyof typeof EventType | string;
  imageUrl?: string;
  location?: string;
  isActive?: boolean;
}

export enum EventType {
  Festa = 1,
  Evento = 2,
  Celebracao = 3,
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
  Festa = 5,
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
  type: SpiritualContentType | keyof typeof SpiritualContentType | string;
  category: SpiritualCategory | keyof typeof SpiritualCategory | string;
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

export interface SiteSettingsDto {
  address: string;
  email: string;
  phone: string;
  instagram: string;
  historyTitle: string;
  historySubtitle?: string;
  historyHtml?: string;
  historyMissionText?: string;
  institutionalEmail: string;
  primaryPhone: string;
  secondaryPhone?: string;
  whatsappNumber?: string;
  serviceHours?: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  referenceNotes?: string;
  mapEmbedUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  whatsappUrl?: string;
  pixKey?: string;
  pixPayload?: string;
  pixRecipientName?: string;
  pixCity?: string;
  bankName?: string;
  bankAgency?: string;
  bankAccount?: string;
  bankAccountType?: string;
  companyDocument?: string;
  aboutText: string;
}

export interface CreateContactMessageRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface Guide {
  id: number;
  name: string;
  description: string;
  photoUrl?: string;
  specialties: string[];
  entryDate: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
