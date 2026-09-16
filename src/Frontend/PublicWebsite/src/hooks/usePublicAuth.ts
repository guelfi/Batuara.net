import { useAuth } from '../contexts/AuthContext';

/**
 * Lightweight session hook for PublicWebsite (Phase 2 auth plumbing).
 * Prefer useAuth when you need the full context API.
 */
export const usePublicAuth = () => {
  const { isAuthenticated, isLoading, user, role, loginUrl, logout, refreshSession } = useAuth();
  return { isAuthenticated, isLoading, user, role, loginUrl, logout, refreshSession };
};

export default usePublicAuth;
