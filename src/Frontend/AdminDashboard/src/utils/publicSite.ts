/**
 * Public website root for the current deployment path layout.
 * Local/nginx prefixed: /batuara-public/
 * Production (www.batuara.org.br): /
 */
export const resolvePublicSiteUrl = (): string => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname || '';
    if (path.startsWith('/batuara-public') || path.startsWith('/batuara-admin')) {
      return '/batuara-public/';
    }
  }
  return '/';
};
