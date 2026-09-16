import { ContentVisibility } from '../types';

/**
 * API uses JsonStringEnumConverter, so visibility may arrive as
 * "Hidden" | "Authenticated" | "Public" or as 0 | 1 | 2.
 */
export const asVisibility = (
  value?: number | string | ContentVisibility | null
): ContentVisibility => {
  if (value === ContentVisibility.Public || value === 'Public' || value === '2') {
    return ContentVisibility.Public;
  }
  if (
    value === ContentVisibility.Authenticated ||
    value === 'Authenticated' ||
    value === '1'
  ) {
    return ContentVisibility.Authenticated;
  }
  if (value === ContentVisibility.Hidden || value === 'Hidden' || value === '0') {
    return ContentVisibility.Hidden;
  }
  if (value === 2) return ContentVisibility.Public;
  if (value === 1) return ContentVisibility.Authenticated;
  if (value === 0) return ContentVisibility.Hidden;
  return ContentVisibility.Hidden;
};

export const canShowSpiritual = (
  visibility: ContentVisibility,
  isAuthenticated: boolean
): boolean => {
  if (visibility === ContentVisibility.Public) return true;
  if (visibility === ContentVisibility.Authenticated) return isAuthenticated;
  return false;
};
