import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Settings, ExternalLink } from 'lucide-react';
import { Container } from '../ui/Container';
import { ThemeToggle } from '../ui/ThemeToggle';
import { AdminGate } from '../admin/AdminGate';
import { Button } from '../ui/Button';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if already authenticated
    if (sessionStorage.getItem('admin_authenticated')) {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const navigation = [
    { name: 'Accueil', href: '#hero', isPage: false },
    { name: 'Nos affiches', href: '#gallery', isGradient: true, isPage: false },
    { name: 'Comment ça marche', href: '#how-it-works', isPage: false },
    { name: 'FAQ', href: '/faq', isPage: true },
    { name: 'Actualités', href: '/news', isPage: true },
    { name: 'Contact', href: '#contact', isPage: false }
  ];

  const handleNavigation = (item: any) => {
    if (item.isPage) {
      navigate(item.href);
    } else {
      // Fermer le menu mobile d'abord
      setIsMenuOpen(false);
      
      // Fonction pour scroller vers l'élément
      const scrollToElement = () => {
        const element = document.querySelector(item.href);
        if (element) {
          // Calculer l'offset pour tenir compte du header sticky
          const headerHeight = 64; // hauteur du header (h-16 = 64px)
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerHeight;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      };
      
      // Si nous ne sommes pas sur la page d'accueil, naviguer d'abord
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
        // Attendre que la navigation soit terminée puis scroller
        setTimeout(scrollToElement, 200);
      } else {
        // Si nous sommes déjà sur la page d'accueil, scroller directement
        setTimeout(scrollToElement, 100);
      }
    }
  };

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      navigate('/admin');
    } else {
      setShowAdminAuth(true);
    }
    setIsMenuOpen(false);
  };

  const handleAdminAuthenticated = () => {
    setIsAdminAuthenticated(true);
    setShowAdminAuth(false);
    navigate('/admin');
  };

  // Gérer le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    // Cleanup au démontage du composant
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <Container>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-3"
            >
              <img 
                src="https://ydlyokoawuivemrqphos.supabase.co/storage/v1/object/public/Logo%20du%20site/Yad-La-Shlouhim-Affiches-communautaire-juive-paris-logo-rond.png"
                alt="Yad La'Shlouhim Logo"
                className="w-10 h-10 object-contain"
              />
              {/* Logo texte - version blanche pour mode sombre, version normale pour mode clair */}
              <img 
                src="https://ydlyokoawuivemrqphos.supabase.co/storage/v1/object/public/Logo%20du%20site/Yad-La-Shlouhim-Affiches-communautaire-juive-paris-logo-blanc.png"
                alt="Yad La'Shlouhim"
                className="h-10 object-contain dark:block hidden"
              />
              <img 
                src="https://ydlyokoawuivemrqphos.supabase.co/storage/v1/object/public/Logo%20du%20site/Yad-La-Shlouhim-Affiches-communautaire-juive-paris-logo.png"
                alt="Yad La'Shlouhim"
                className="h-10 object-contain block dark:hidden"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  className={`text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    item.isGradient
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <button 
                onClick={handleAdminClick}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                <Settings className="w-4 h-4" />
                Admin
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-4 md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
        isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu Panel */}
        <div className={`fixed right-0 top-0 h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-l border-gray-200/50 dark:border-gray-700/50 transform transition-transform duration-300 ease-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          
          {/* Header du menu */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <img 
                src="https://ydlyokoawuivemrqphos.supabase.co/storage/v1/object/public/Logo%20du%20site/Yad-La-Shlouhim-Affiches-communautaire-juive-paris-logo-rond.png"
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="text-base font-semibold text-gray-900 dark:text-white">Menu</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-6">
            <div className="space-y-2">
              {navigation.map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  className={`group block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-[0.98] active:scale-95 ${
                    item.isGradient
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      item.isGradient 
                        ? 'bg-white/50 group-hover:bg-white/80' 
                        : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500 dark:group-hover:bg-blue-400'
                    }`} />
                  </div>
                </button>
              ))}
            </div>
            
            {/* Section Services */}
            <div className="pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <a
                href="https://linktr.ee/Yadshlouhim"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-700 dark:to-emerald-800 text-white rounded-xl shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-200 transform hover:scale-[0.98] active:scale-95"
                style={{
                  animationDelay: `${navigation.length * 50 + 50}ms`
                }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">Tous nos services</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-white/50" />
              </a>
            </div>
            
            {/* Section Admin */}
            <div className="pt-6 mt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <button 
                onClick={handleAdminClick}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 text-white rounded-xl shadow-lg shadow-gray-500/25 hover:shadow-xl hover:shadow-gray-500/30 transition-all duration-200 transform hover:scale-[0.98] active:scale-95"
                style={{
                  animationDelay: `${navigation.length * 50 + 100}ms`
                }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">Administration</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-white/50" />
              </button>
            </div>
          </nav>

          {/* Footer du menu */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                © 2025 Yad La'Shlouhim
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Communication simplifiée
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Authentication Modal */}
      {showAdminAuth && (
        <AdminGate 
          onAuthenticated={handleAdminAuthenticated}
          onClose={() => setShowAdminAuth(false)}
        />
      )}
    </>
  );
};