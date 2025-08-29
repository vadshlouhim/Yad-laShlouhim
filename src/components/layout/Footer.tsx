import { Container } from '../ui/Container';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 dark:from-blue-900 dark:to-purple-900 text-gray-800 dark:text-white transition-colors duration-200">
      <Container>
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Company Information */}
            <div className="md:col-span-1">
              <div className="mb-6">
                <div className="mb-4">
                  {/* Logo - White version for dark theme */}
                  <img 
                    src="https://ydlyokoawuivemrqphos.supabase.co/storage/v1/object/public/Logo%20du%20site/Yad-La-Shlouhim-Affiches-communautaire-juive-paris-logo-blanc.png"
                    alt="Yad la'Shlouhim"
                    className="h-16 w-auto dark:block hidden"
                  />
                  {/* Logo - Colored version for light theme */}
                  <img 
                    src="https://ydlyokoawuivemrqphos.supabase.co/storage/v1/object/public/Logo%20du%20site/Yad-La-Shlouhim-Affiches-communautaire-juive-paris-logo.png"
                    alt="Yad la'Shlouhim"
                    className="h-16 w-auto block dark:hidden"
                  />
                </div>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Créateur d'affiches premium pour la communauté juive. 
                  Nous transformons vos événements en moments mémorables.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                  <span className="text-gray-600 dark:text-gray-300">Yad-lashlouhim770@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                  <span className="text-gray-600 dark:text-gray-300">+33 6 67 28 88 51</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                  <span className="text-gray-600 dark:text-gray-300">France</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                Navigation
              </h3>
              <ul className="space-y-3">
                <li><a href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200">Accueil</a></li>
                <li><a href="/nos-affiches" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200">Galerie</a></li>
                <li><a href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200">Contact</a></li>
                <li><a href="/devis" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200">Devis Gratuit</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-400 dark:border-blue-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                © 2025 Yad La'Shlouhim. Tous droits réservés. Site web réalisé par WebFitYou.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200">
                  CGV
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200">
                  Confidentialité
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};