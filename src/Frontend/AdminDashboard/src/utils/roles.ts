import { UserRole } from '../types';

const ROLE_NAME_MAP: Record<string, UserRole> = {
  Admin: UserRole.Admin,
  Editor: UserRole.Editor,
  Member: UserRole.Member,
};

/**
 * O backend serializa enums como string (ex.: "Admin"), mas o tipo TS `UserRole` é numérico.
 * Normaliza o valor bruto vindo da API/localStorage para o número correto antes de qualquer comparação.
 */
export const normalizeUserRole = (role: unknown): UserRole => {
  if (typeof role === 'number') return role as UserRole;
  if (typeof role === 'string' && ROLE_NAME_MAP[role] !== undefined) return ROLE_NAME_MAP[role];
  return UserRole.Member;
};

export const getRoleLabel = (role?: UserRole | null): string => {
  switch (role) {
    case UserRole.Admin:
      return 'Administrador';
    case UserRole.Editor:
      return 'Editor';
    case UserRole.Member:
      return 'Filho da Casa';
    default:
      return 'Desconhecido';
  }
};

export const isAdmin = (role?: UserRole | null): boolean =>
  role != null && normalizeUserRole(role) === UserRole.Admin;

export const isEditorOrAdmin = (role?: UserRole | null): boolean => {
  if (role == null) return false;
  const normalized = normalizeUserRole(role);
  return normalized === UserRole.Admin || normalized === UserRole.Editor;
};

export const isMember = (role?: UserRole | null): boolean =>
  role != null && normalizeUserRole(role) === UserRole.Member;
