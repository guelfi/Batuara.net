// Tipos compartilhados com o backend
export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export enum UserRole {
  Admin = 1,
  Editor = 2,
  Viewer = 3,
  Member = 4,
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  expiresAt: string;
  user: User;
}

export interface MemberLoginResponse {
  token: string;
  expiresAt: string;
  user: User & { houseMemberId: number };
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
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
  pixQrCodeBase64?: string;
  bankName?: string;
  bankAgency?: string;
  bankAccount?: string;
  bankAccountType?: string;
  companyDocument?: string;
  aboutText: string;
}

export enum ContactMessageStatus {
  New = 1,
  InProgress = 2,
  Resolved = 3,
  Archived = 4,
}

export enum ContributionPaymentStatus {
  Pending = 1,
  Paid = 2,
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  type: EventType;
  imageUrl?: string;
  cardColor?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  startTime?: string;
  endTime?: string;
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
  colors: string[];
  elements: string[];
  characteristics: string[];
  imageUrl?: string;
  displayOrder: number;
  saudacao?: string;
  fruta?: string;
  comida?: string;
  diaDaSemana?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Guide {
  id: number;
  name: string;
  description: string;
  specialties: string[];
  displayOrder: number;
  comida?: string;
  fruta?: string;
  diaDaSemana?: string;
  cor?: string;
  saudacao?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HouseMemberContribution {
  id: number;
  referenceMonth: string;
  dueDate: string;
  amount: number;
  status: ContributionPaymentStatus;
  paidAt?: string;
  notes?: string;
  isRecurring: boolean;
  allowWhatsAppReminder: boolean;
  reminderSentAt?: string;
  reminderLastAttemptAt?: string;
  reminderAttemptCount: number;
}

export interface HouseMember {
  id: number;
  fullName: string;
  birthDate: string;
  entryDate: string | null;
  headOrixaFront: string | null;
  headOrixaBack: string | null;
  headOrixaRonda: string | null;
  email: string | null;
  mobilePhone: string | null;
  zipCode: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  amaciDate: string | null;
  yaoDate: string | null;
  smallParent: string | null;
  religiousLeader: string | null;
  notes: string | null;
  currentMonthContributionStatus?: ContributionPaymentStatus;
  currentMonthDueDate?: string;
  currentMonthPaidAt?: string;
  contributions: HouseMemberContribution[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessage {
  id: number;
  messageId: string;
  senderPhone: string;
  recipientPhone: string;
  body: string;
  isFromMe: boolean;
  sentAt: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  isRead: boolean;
  wantsWhatsAppResponse: boolean;
  whatsAppResponseSentAt?: string;
  whatsAppResponseText?: string;
  adminNotes?: string;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
  whatsAppMessages?: WhatsAppMessage[];
}

export interface UmbandaLine {
  id: number;
  name: string;
  description: string;
  entities: string[];
  workingDays: string[];
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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

export interface RevokeTokenRequest {
  refreshToken: string;
}

// Tipos específicos do dashboard
export interface DashboardStats {
  /** Eventos ativos de hoje até 31/12 do ano corrente */
  eventsUntilEndOfYear: number;
  /** Atendimentos espirituais (Umbanda + Kardecismo) de hoje até 31/12 */
  attendancesUntilEndOfYear: number;
  /** Filhos da Casa com isActive = true */
  activeHouseMembers: number;
  /** Eventos + Atendimentos no mês corrente */
  currentMonthActivity: number;
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
