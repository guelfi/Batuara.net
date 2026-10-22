export interface CookieConsent {
  necessary: true;
  thirdParty: boolean;
  decidedAt: string;
}

const STORAGE_KEY = 'batuara_cookie_consent';
export const COOKIE_CONSENT_EVENT = 'batuara:cookie-consent-changed';
export const COOKIE_PREFERENCES_EVENT = 'batuara:open-cookie-preferences';

export const getCookieConsent = (): CookieConsent | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    return typeof parsed.thirdParty === 'boolean' ? parsed : null;
  } catch {
    return null;
  }
};

export const saveCookieConsent = (thirdParty: boolean): CookieConsent => {
  const consent: CookieConsent = { necessary: true, thirdParty, decidedAt: new Date().toISOString() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: consent }));
  return consent;
};

export const hasThirdPartyConsent = (): boolean => getCookieConsent()?.thirdParty === true;

export const openCookiePreferences = (): void => {
  window.dispatchEvent(new CustomEvent(COOKIE_PREFERENCES_EVENT));
};
