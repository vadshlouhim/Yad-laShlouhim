import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Send, Mail, Phone, MapPin, ShoppingBag, Eye, Star, Moon, Calendar, Heart, GraduationCap, Sparkles, ArrowRight, ExternalLink, PartyPopper, Zap, BookOpen, Users, Gift, FileText, Crown, Music, Folder, Magnet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { SearchBar } from '../components/ui/SearchBar';
import { SEOHead } from '../components/seo/SEOHead';
import { StructuredData } from '../components/seo/StructuredData';
import { supabase } from '../lib/supabase';
import { Poster, Category } from '../types';
import { PurchaseModal } from '../components/purchase/PurchaseModal';
import { isSupabaseConfigured } from '../lib/supabase';

export const HomePage = () => {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [featuredPosters, setFeaturedPosters] = useState<Poster[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<Poster[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    project: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPosterForPurchase, setSelectedPosterForPurchase] = useState<Poster | null>(null);
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(4);
  const [visiblePostersCount, setVisiblePostersCount] = useState(4);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-scroll effect for hero section (utilise les affiches favorites)
  useEffect(() => {
    if (featuredPosters.length > 2) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex >= featuredPosters.length - 2 ? 0 : prevIndex + 1
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [featuredPosters.length]);

  const loadData = async () => {
    // Vérifier si Supabase est configuré
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using fallback data');
      setLoading(false);
      return;
    }
    
    let postersResponse: any = null;
    
    try {
      const [postersRes, featuredPostersResponse, categoriesResponse] = await Promise.all([
        supabase
          .from('posters')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('posters')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('is_published', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(4),
        supabase
          .from('categories')
          .select('*')
          .order('name')
      ]);
      

      postersResponse = postersRes;

      if (postersResponse.error) throw postersResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;

      setPosters(postersResponse.data || []);
      setCategories(categoriesResponse.data || []);
      
      // Charger les affiches favorites ou utiliser les 4 premières si aucune favorite
      if (featuredPostersResponse.data && featuredPostersResponse.data.length > 0) {
        setFeaturedPosters(featuredPostersResponse.data);
      } else {
        // Si pas d'affiches favorites, prendre les 4 premières affiches publiées
        setFeaturedPosters((postersResponse.data || []).slice(0, 4));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // En cas d'erreur (par exemple colonne is_featured n'existe pas), utiliser les 4 premières affiches
      const fallbackPosters = (postersResponse?.data || []).slice(0, 4);
      setFeaturedPosters(fallbackPosters);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour gérer la recherche
  const handleSearch = (results: Poster[], term: string) => {
    setSearchResults(results);
    setSearchTerm(term);
    // Réinitialiser la sélection de catégorie lors d'une recherche
    if (term.trim()) {
      setSelectedCategory(null);
    }
  };

  // Logique de filtrage combinée (recherche + catégorie)
  const filteredPosters = searchTerm.trim() 
    ? searchResults  // Si recherche active, utiliser les résultats de recherche
    : selectedCategory 
      ? posters.filter(poster => poster.category_id === selectedCategory)  // Sinon, filtrer par catégorie
      : posters;  // Sinon, afficher tout

  const visibleCategories = categories.slice(0, visibleCategoriesCount);
  const visiblePosters = filteredPosters.slice(0, visiblePostersCount);
  
  const hasMoreCategories = categories.length > visibleCategoriesCount;
  const hasMorePosters = filteredPosters.length > visiblePostersCount;

  const showMoreCategories = () => {
    setVisibleCategoriesCount(prev => prev + 4);
  };

  const showLessCategories = () => {
    setVisibleCategoriesCount(4);
  };

  const showMorePosters = () => {
    setVisiblePostersCount(prev => prev + 4);
  };

  const showLessPosters = () => {
    setVisiblePostersCount(4);
  };

  // Reset des compteurs quand on change de catégorie
  useEffect(() => {
    setVisiblePostersCount(4);
  }, [selectedCategory]);

  // L'achat passe désormais par la modale avant Stripe

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Here you would integrate with EmailJS
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFormSent(true);
      setFormData({ name: '', email: '', phone: '', project: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextPosters = () => {
    if (posters.length > 2) {
      setCurrentIndex((prevIndex) => 
        prevIndex >= posters.length - 2 ? 0 : prevIndex + 1
      );
    }
  };

  const prevPosters = () => {
    if (posters.length > 2) {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? posters.length - 2 : prevIndex - 1
      );
    }
  };

  const openPurchaseModal = (poster: Poster) => {
    setSelectedPosterForPurchase(poster);
    setShowPurchaseModal(true);
  };

  const renderHeroPosterCard = (_poster: Poster, index: number) => {
    const posterIndex = currentIndex + index;
    if (posterIndex >= featuredPosters.length) return null;

    const currentPoster = featuredPosters[posterIndex];
    
    return (
      <div 
        key={currentPoster.id}
        className="group relative w-40 sm:w-56 lg:w-64 h-52 sm:h-72 lg:h-80 rounded-lg shadow-xl overflow-hidden transition-all duration-500 hover:scale-105"
      >
        <div className="w-full h-full relative">
          {currentPoster.image_url ? (
            <img 
              src={currentPoster.image_url} 
              alt={currentPoster.title || 'Affiche'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(to bottom right, #3B82F6, #1E40AF)'
              }}
            >
              <span className="text-white text-4xl">📄</span>
            </div>
          )}
          
          {/* Price Overlay - Appears on hover */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 sm:p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center justify-between gap-2">
              <span className="text-white text-sm sm:text-lg font-semibold truncate">
                {formatPrice(currentPoster.price_cents, currentPoster.currency)}
              </span>
              <Button
                onClick={() => openPurchaseModal(currentPoster)}
                size="sm"
                className="bg-white text-gray-900 hover:bg-gray-100 border-0 flex-shrink-0 px-2 sm:px-3 py-1 sm:py-2"
              >
                <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline ml-1 sm:ml-0">Acheter</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  };

  // Fonction pour obtenir l'icône et la couleur d'une catégorie
  const getCategoryIcon = (iconName: string, isSelected: boolean) => {
    // Mapping des icônes avec couleurs dégradées uniques et modernes
    const iconMap: Record<string, { icon: any, gradient: string, shadow: string }> = {
      'Calendar': { 
        icon: Calendar, 
        gradient: 'bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600', 
        shadow: 'shadow-lg shadow-pink-500/30' 
      },
      'Star': { 
        icon: Star, 
        gradient: 'bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600', 
        shadow: 'shadow-lg shadow-blue-500/30' 
      },
      'Sparkles': { 
        icon: Sparkles, 
        gradient: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500', 
        shadow: 'shadow-lg shadow-orange-500/30' 
      },
      'Heart': { 
        icon: Heart, 
        gradient: 'bg-gradient-to-br from-red-400 via-pink-500 to-rose-600', 
        shadow: 'shadow-lg shadow-red-500/30' 
      },
      'PartyPopper': { 
        icon: PartyPopper, 
        gradient: 'bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-600', 
        shadow: 'shadow-lg shadow-purple-500/30' 
      },
      'Moon': { 
        icon: Moon, 
        gradient: 'bg-gradient-to-br from-indigo-400 via-blue-500 to-cyan-600', 
        shadow: 'shadow-lg shadow-indigo-500/30' 
      },
      'Zap': { 
        icon: Zap, 
        gradient: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600', 
        shadow: 'shadow-lg shadow-yellow-500/30' 
      },
      'BookOpen': { 
        icon: BookOpen, 
        gradient: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600', 
        shadow: 'shadow-lg shadow-emerald-500/30' 
      },
      'GraduationCap': { 
        icon: GraduationCap, 
        gradient: 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600', 
        shadow: 'shadow-lg shadow-cyan-500/30' 
      },
      'Users': { 
        icon: Users, 
        gradient: 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600', 
        shadow: 'shadow-lg shadow-green-500/30' 
      },
      'Gift': { 
        icon: Gift, 
        gradient: 'bg-gradient-to-br from-pink-400 via-rose-500 to-red-600', 
        shadow: 'shadow-lg shadow-pink-500/30' 
      },
      'FileText': { 
        icon: FileText, 
        gradient: 'bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600', 
        shadow: 'shadow-lg shadow-slate-500/30' 
      },
      'Magnet': { 
        icon: Magnet, 
        gradient: 'bg-gradient-to-br from-red-400 via-orange-500 to-amber-600', 
        shadow: 'shadow-lg shadow-red-500/30' 
      },
      'Crown': { 
        icon: Crown, 
        gradient: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600', 
        shadow: 'shadow-lg shadow-amber-500/30' 
      },
      'Music': { 
        icon: Music, 
        gradient: 'bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-600', 
        shadow: 'shadow-lg shadow-violet-500/30' 
      },
      'Folder': { 
        icon: Folder, 
        gradient: 'bg-gradient-to-br from-gray-400 via-slate-500 to-gray-600', 
        shadow: 'shadow-lg shadow-gray-500/30' 
      }
    };

    const categoryData = iconMap[iconName] || { 
      icon: Star, 
      gradient: 'bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600', 
      shadow: 'shadow-lg shadow-blue-500/30' 
    };
    
    return {
      icon: categoryData.icon,
      color: isSelected 
        ? `${categoryData.gradient} ${categoryData.shadow} scale-110 ring-4 ring-white/30` 
        : `${categoryData.gradient} ${categoryData.shadow} hover:scale-105 hover:shadow-xl`
    };
  };

  return (
    <>
      <SEOHead
        title="Yad La'Shlouhim - Affiches Communautaires Juives Design"
        description="🎨 Templates Canva professionnels pour événements juifs : Shabbat, fêtes, Bar Mitzvah. ⚡ Accès immédiat, personnalisation facile. 📍 Communauté juive Paris & France."
        keywords="affiches juives, templates canva, événements communautaires, shabbat, fêtes juives, invitations, design, personnalisation, communauté juive, paris, bar mitzvah, roch hachana, kippour, hanoucca, pessah, pourim, lag baomer, chavouot, souccot"
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      
      <StructuredData
        type="organization"
        data={{
          services: [
            "Templates d'affiches Canva",
            "Design graphique communautaire", 
            "Personnalisation d'événements juifs",
            "Communication visuelle religieuse"
          ]
        }}
      />
      
      <StructuredData
        type="website"
        data={{
          searchAction: true,
          mainEntity: {
            "@type": "ItemList",
            "name": "Catégories d'affiches",
            "numberOfItems": categories.length,
            "itemListElement": categories.slice(0, 5).map((category, index) => ({
              "@type": "Thing",
              "position": index + 1,
              "name": category.name,
              "url": `https://yad-lashlouhim.com/#${category.slug}`
            }))
          }
        }}
      />

      {/* Schema pour les produits/affiches */}
      {featuredPosters.length > 0 && (
        <StructuredData
          type="product"
          data={{
            name: "Collection d'affiches communautaires juives",
            description: "Templates Canva professionnels pour tous vos événements communautaires",
            image: featuredPosters[0]?.image_url,
            price_cents: 3800, // Prix moyen
            currency: "EUR",
            url: "https://yad-lashlouhim.com/",
            brand: "Yad La'Shlouhim",
            category: "Design graphique",
            availability: "InStock"
          }}
        />
      )}

      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      
      {/* Hero Section */}
      <section id="hero" className="py-12 sm:py-16 lg:py-20 animate-fade-in">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left Side - Title and Slogan */}
            <div className="text-center lg:text-left px-4 sm:px-0">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                <span className="text-gray-900 dark:text-white block sm:inline">Yad</span>{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block sm:inline">
                  La'Shlouhim
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
                + de 150 modèles d'affiches personnalisables avec Canva en quelques secondes
              </p>
            </div>

            {/* Right Side - Posters Carousel */}
            <div className="flex flex-col items-center">
              <div className="text-center mb-12">
                <div className="inline-block">
                  <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    Les affiches du moment
                  </h2>
                  <div className="w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">
                </p>
              </div>

              {loading ? (
                <div className="flex gap-2 sm:gap-4 lg:gap-8 justify-center">
                  <div className="w-40 sm:w-56 lg:w-80 h-52 sm:h-72 lg:h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
                  <div className="w-40 sm:w-56 lg:w-80 h-52 sm:h-72 lg:h-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
                </div>
              ) : featuredPosters.length > 0 ? (
                <div className="relative">
                  {featuredPosters.length > 2 && (
                    <>
                      <button
                        onClick={prevPosters}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 sm:-translate-x-12 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={nextPosters}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 sm:translate-x-12 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                    </>
                  )}

                  <div className="flex gap-2 sm:gap-4 lg:gap-6 justify-center">
                    {renderHeroPosterCard(featuredPosters[0], 0)}
                    {featuredPosters.length > 1 && renderHeroPosterCard(featuredPosters[1], 1)}
                  </div>

                  {featuredPosters.length > 2 && (
                    <div className="flex justify-center gap-2 mt-6">
                      {Array.from({ length: Math.ceil(featuredPosters.length / 2) }, (_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index * 2)}
                          className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                            Math.floor(currentIndex / 2) === index ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <p>Aucune affiche disponible pour le moment</p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Call to Action Button */}
      <section className="py-6 bg-white dark:bg-gray-900">
        <Container>
          <div className="text-center">
            <Button
              onClick={() => {
                const element = document.querySelector('#gallery');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              size="md"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Eye className="w-5 h-5 mr-2" />
              Découvrir nos affiches
            </Button>
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 bg-white dark:bg-gray-900">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
              Comment ça marche ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Choisissez votre affiche
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Parcourez notre galerie et sélectionnez l'affiche qui correspond à votre événement
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Achetez et personnalisez
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Effectuez votre achat sécurisé et recevez immédiatement le lien Canva pour personnaliser
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Téléchargez et partagez
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Personnalisez sur Canva, téléchargez en haute qualité et partagez votre création
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 hidden md:grid">
            <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Accès instantané</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lien Canva envoyé immédiatement</p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Personnalisation facile</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Interface Canva intuitive</p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📐</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Mise en page préservée</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Design professionnel garanti</p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💫</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Qualité premium</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Résolution haute définition</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Posters Gallery Section */}
      <section id="gallery" className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-800">
        <Container>
          {/* Services Button Section */}
          <div className="text-center mb-12 sm:mb-16">
            <a 
              href="https://linktr.ee/Yadshlouhim" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Tous nos services
              </Button>
            </a>
            <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">
              Yad la-Shlouhim propose également d'autres services dédiés aux Shlouhim
            </p>
          </div>

          {/* Categories Filter */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center mb-6 sm:mb-8 px-4 sm:px-0">
              Nos affiches
            </h2>
            
            {/* Barre de recherche style Apple */}
            <div className="mb-8 sm:mb-12">
              <SearchBar
                posters={posters}
                categories={categories}
                onSearch={handleSearch}
                placeholder="Rechercher une affiche, catégorie..."
              />
            </div>
            
            {/* Affichage des résultats de recherche */}
            {searchTerm.trim() && (
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
                  <span>🔍</span>
                  <span>
                    {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} pour "{searchTerm}"
                  </span>
                  <button 
                    onClick={() => handleSearch([], '')}
                    className="ml-2 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full p-1 transition-colors"
                  >
                    <span className="text-xs">✕</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Catégories - masquées lors d'une recherche active */}
            {!searchTerm.trim() && (
              <>
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
                  <div
                    className={`flex flex-col items-center gap-2 sm:gap-3 cursor-pointer group transition-all duration-300 ${
                      !selectedCategory ? 'scale-110' : 'hover:scale-105'
                    }`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ${
                      !selectedCategory 
                          ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 shadow-xl shadow-purple-500/50 scale-110' 
                          : 'bg-gradient-to-br from-slate-400 via-gray-500 to-slate-600 shadow-slate-500/40 hover:scale-105'
                    }`}>
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center max-w-16 sm:max-w-20">
                      Toutes
                    </span>
                  </div>
                
                {visibleCategories.map((category) => {
                  const { icon: IconComponent, color } = getCategoryIcon(category.icon, selectedCategory === category.id);
                  return (
                    <div
                      key={category.id}
                      className={`flex flex-col items-center gap-2 sm:gap-3 cursor-pointer group transition-all duration-300 ${
                        selectedCategory === category.id ? 'scale-110' : 'hover:scale-105'
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 ${color} rounded-full flex items-center justify-center text-white transition-all duration-300`}>
                        <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center max-w-16 sm:max-w-20">
                        {category.name}
                      </span>
                    </div>
                  );
                })}
                </div>

                {/* Boutons pour les catégories */}
                <div className="flex justify-center gap-4 mt-8">
                  {hasMoreCategories && (
                    <Button
                      onClick={showMoreCategories}
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
                    >
                      Voir plus de catégories
                    </Button>
                  )}
                  
                  {visibleCategoriesCount > 4 && (
                    <Button
                      onClick={showLessCategories}
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
                    >
                      Voir moins
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Posters Grid - Gallery Style */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl aspect-[4/5]" />
                </div>
              ))}
            </div>
          ) : searchTerm.trim() && searchResults.length === 0 ? (
            // Aucun résultat de recherche
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">
                <span className="text-6xl opacity-30">🔍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                Aucun résultat trouvé
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">
                Aucune affiche trouvée pour "{searchTerm}"
              </p>
              <div className="space-y-3 text-sm text-gray-400">
                <p>💡 Conseils de recherche :</p>
                <div className="flex flex-wrap justify-center gap-4 max-w-md mx-auto">
                  <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">Vérifiez l'orthographe</span>
                  <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">Utilisez des mots-clés simples</span>
                  <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">Essayez une catégorie</span>
                </div>
              </div>
              <div className="mt-8">
                <Button 
                  onClick={() => handleSearch([], '')}
                  variant="secondary"
                >
                  Voir toutes les affiches
                </Button>
              </div>
            </div>
          ) : visiblePosters.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
                {visiblePosters.map((poster) => (
                  <div key={poster.id} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                    {/* Poster Image */}
                    <div className="relative aspect-[4/5] overflow-hidden">
                      {poster.image_url ? (
                        <img
                          src={poster.image_url}
                          alt={poster.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                          <span className="text-4xl opacity-50">📄</span>
                        </div>
                      )}
                      
                      {/* Price Overlay - Appears on hover */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-lg font-semibold">
                            {formatPrice(poster.price_cents, poster.currency)}
                          </span>
                          <Button
                            onClick={() => openPurchaseModal(poster)}
                            size="sm"
                            className="bg-white text-gray-900 hover:bg-gray-100 border-0"
                          >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Acheter
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Boutons pour les affiches */}
              <div className="flex justify-center gap-4 mt-12">
                {hasMorePosters && (
                  <Button
                    onClick={showMorePosters}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Voir plus d'affiches
                  </Button>
                )}
                
                {visiblePostersCount > 4 && (
                  <Button
                    onClick={showLessPosters}
                    size="lg"
                    variant="outline"
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Voir moins
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  📋
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Aucune affiche trouvée
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Essayez de modifier vos filtres ou votre recherche.
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white dark:bg-gray-900">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Parlons de votre Projet
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Une idée d'affiche personnalisée ? Contactez-nous !
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Left Panel - Contact and Service Information */}
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">Yad-lashlouhim770@gmail.com</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Réponse garantie sous 2h</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">+33 6 67 28 88 51</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">WhatsApp disponible</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">France</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Livraison dans toute la France</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">Réponds instantanément</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Service disponible 24h/24</p>
                  </div>
                </div>
              </div>

              {/* Right Panel - Project Submission Form */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Votre nom et prénom"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="votre@email.fr"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="01 XX XX XX XX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Votre projet
                    </label>
                    <textarea
                      name="project"
                      value={formData.project}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="Décrivez votre événement, le type d'affiche souhaité..."
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    loading={formLoading}
                    icon={Send}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  >
                    Envoyer ma demande
                  </Button>
                </form>

                {formSent && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <p className="text-green-700 dark:text-green-400 font-medium text-center">
                      ✅ Demande envoyée avec succès ! Nous vous répondrons rapidement.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Section - SEO Content */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
              Trouvez rapidement les réponses à vos questions sur nos affiches Canva
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Comment fonctionne le paiement ?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Paiement 100% sécurisé via Stripe. Accès immédiat à votre modèle Canva après validation.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Puis-je personnaliser les modèles ?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Oui ! Tous nos modèles sont 100% personnalisables : textes, couleurs, polices, images.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Quel est le délai de livraison ?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Accès instantané ! Votre lien Canva est envoyé immédiatement après le paiement.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Puis-je réutiliser le modèle ?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Bien sûr ! Usage illimité de votre modèle pour tous vos événements.
                </p>
              </div>
            </div>

            <Link to="/faq">
              <Button variant="outline" size="lg">
                <ExternalLink className="w-5 h-5 mr-2" />
                Voir toutes les questions
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedPosterForPurchase && (
        <PurchaseModal
          posterId={selectedPosterForPurchase.id}
          posterImage={selectedPosterForPurchase.image_url}
          posterTitle={selectedPosterForPurchase.title}
          priceLabel={formatPrice(selectedPosterForPurchase.price_cents, selectedPosterForPurchase.currency)}
          onClose={() => setShowPurchaseModal(false)}
        />
      )}
    </div>
    </>
  );
};