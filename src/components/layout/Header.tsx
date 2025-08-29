import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Settings } from 'lucide-react';
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
      // Si nous ne sommes pas sur la page d'accueil, naviguer d'abord vers la page d'accueil
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
        // Attendre que la navigation soit terminée puis scroller
        setTimeout(() => {
          const element = document.querySelector(item.href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        // Si nous sommes déjà sur la page d'accueil, scroller directement
        const element = document.querySelector(item.href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
    setIsMenuOpen(false);
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
              <img 
                src="https://ydlyokoawuivemrqphos.supabase.co/storage/v1/object/public/Logo%20du%20site/Yad-La-Shlouhim-Affiches-communautaire-juive-paris-logo.png"
                alt="Yad La'Shlouhim"
                className="h-10 object-contain"
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

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="p-4">
              <div className="space-y-4">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item)}
                    className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      item.isGradient
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
                  <button 
                    onClick={handleAdminClick}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

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