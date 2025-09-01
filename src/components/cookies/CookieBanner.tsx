import { useState, useEffect } from 'react';
import { Cookie, X, Shield, Settings } from 'lucide-react';
import { Button } from '../ui/Button';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cookieSettings, setCookieSettings] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAllCookies = () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const acceptSelectedCookies = () => {
    const consent = {
      ...cookieSettings,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const rejectOptionalCookies = () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const toggleCookieSetting = (type: keyof typeof cookieSettings) => {
    if (type === 'necessary') return; // Les cookies nécessaires ne peuvent pas être désactivés
    setCookieSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl">
        <div className="max-w-7xl mx-auto p-6">
          {!showSettings ? (
            // Banner principal
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    🍪 Nous utilisons des cookies
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Nous utilisons des cookies pour améliorer votre expérience de navigation, analyser le trafic du site et personnaliser le contenu. 
                    En continuant à utiliser notre site, vous acceptez notre utilisation des cookies.
                  </p>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                  >
                    Personnaliser les paramètres
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Button
                  onClick={acceptAllCookies}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                >
                  Accepter tout
                </Button>
                <Button
                  onClick={rejectOptionalCookies}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Refuser les optionnels
                </Button>
              </div>
            </div>
          ) : (
            // Paramètres détaillés
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Paramètres des cookies
                  </h3>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cookies nécessaires */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        Nécessaires
                      </h4>
                    </div>
                    <div className="w-10 h-6 bg-green-500 rounded-full flex items-center justify-end p-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Ces cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.
                  </p>
                </div>

                {/* Cookies d'analyse */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <span className="text-xs">📊</span>
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        Analytiques
                      </h4>
                    </div>
                    <button
                      onClick={() => toggleCookieSetting('analytics')}
                      className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors duration-200 ${
                        cookieSettings.analytics ? 'bg-blue-500 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Nous aident à comprendre comment les visiteurs utilisent notre site.
                  </p>
                </div>

                {/* Cookies marketing */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                        <span className="text-xs">🎯</span>
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        Marketing
                      </h4>
                    </div>
                    <button
                      onClick={() => toggleCookieSetting('marketing')}
                      className={`w-10 h-6 rounded-full flex items-center p-1 transition-colors duration-200 ${
                        cookieSettings.marketing ? 'bg-purple-500 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Utilisés pour personnaliser les publicités et mesurer leur efficacité.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  onClick={acceptSelectedCookies}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                >
                  Enregistrer mes préférences
                </Button>
                <Button
                  onClick={acceptAllCookies}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Accepter tout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};