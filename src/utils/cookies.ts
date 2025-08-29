export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export const getCookieConsent = (): CookieConsent | null => {
  try {
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
      return JSON.parse(consent);
    }
    return null;
  } catch (error) {
    console.error('Error reading cookie consent:', error);
    return null;
  }
};

export const setCookieConsent = (consent: CookieConsent): void => {
  try {
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
  } catch (error) {
    console.error('Error saving cookie consent:', error);
  }
};

export const hasGivenConsent = (): boolean => {
  return getCookieConsent() !== null;
};

export const hasAnalyticsConsent = (): boolean => {
  const consent = getCookieConsent();
  return consent?.analytics || false;
};

export const hasMarketingConsent = (): boolean => {
  const consent = getCookieConsent();
  return consent?.marketing || false;
};

export const clearCookieConsent = (): void => {
  try {
    localStorage.removeItem('cookie-consent');
  } catch (error) {
    console.error('Error clearing cookie consent:', error);
  }
};

// Fonction pour initialiser Google Analytics seulement si l'utilisateur a consenti
export const initializeAnalytics = (): void => {
  if (hasAnalyticsConsent()) {
    // Ici vous pouvez ajouter le code d'initialisation de Google Analytics
    // Par exemple :
    // gtag('config', 'GA_MEASUREMENT_ID');
    console.log('Analytics initialized');
  }
};

// Fonction pour initialiser les cookies marketing
export const initializeMarketing = (): void => {
  if (hasMarketingConsent()) {
    // Ici vous pouvez ajouter le code d'initialisation des outils marketing
    // Par exemple : Facebook Pixel, Google Ads, etc.
    console.log('Marketing cookies initialized');
  }
};