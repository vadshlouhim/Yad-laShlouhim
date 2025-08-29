import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Tag, ArrowRight, Search } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { SEOHead } from '../components/seo/SEOHead';
import { StructuredData } from '../components/seo/StructuredData';
import { supabase } from '../lib/supabase';
import { NewsArticle } from '../types/news';

export const News = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 12;

  const categories = [
    { value: 'all', label: 'Tous les articles' },
    { value: 'paracha', label: 'Paracha' },
    { value: 'dvar-torah', label: 'Dvar Torah' },
    { value: 'fetes-juives', label: 'Fêtes Juives' },
    { value: 'evenements', label: 'Événements' },
    { value: 'communaute', label: 'Communauté' }
  ];

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) {
        console.log('Using fallback articles');
        // Articles de fallback si la table n'existe pas encore
        setArticles([
          {
            id: '1',
            title: 'Paracha de la semaine - Réflexions et enseignements',
            slug: 'paracha-semaine-reflexions-enseignements',
            excerpt: 'Découvrez les enseignements profonds de la paracha hebdomadaire et leurs applications dans notre vie quotidienne.',
            content: '',
            cover_image: '',
            category: 'paracha',
            tags: ['paracha', 'torah', 'spiritualité'],
            author: 'Yad La\'Shlouhim',
            published_at: new Date().toISOString(),
            is_published: true,
            reading_minutes: 5,
            seo_title: '',
            seo_description: '',
            og_image: '',
            canonical_url: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Préparer Shabbat avec sens et beauté',
            slug: 'preparer-shabbat-sens-beaute',
            excerpt: 'Conseils pratiques et inspirations pour créer des invitations Shabbat mémorables et respectueuses des traditions.',
            content: '',
            cover_image: '',
            category: 'evenements',
            tags: ['shabbat', 'invitations', 'traditions'],
            author: 'Yad La\'Shlouhim',
            published_at: new Date().toISOString(),
            is_published: true,
            reading_minutes: 7,
            seo_title: '',
            seo_description: '',
            og_image: '',
            canonical_url: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Événements communautaires à Paris',
            slug: 'evenements-communautaires-paris',
            excerpt: 'Restez informé des événements, conférences et célébrations de la communauté juive parisienne.',
            content: '',
            cover_image: '',
            category: 'communaute',
            tags: ['paris', 'communauté', 'événements'],
            author: 'Yad La\'Shlouhim',
            published_at: new Date().toISOString(),
            is_published: true,
            reading_minutes: 6,
            seo_title: '',
            seo_description: '',
            og_image: '',
            canonical_url: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      } else {
        setArticles(data || []);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const currentArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'paracha': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'dvar-torah': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'fetes-juives': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'evenements': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'communaute': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  return (
    <>
      <SEOHead
        title="Actualités & Paracha de la semaine - Yad La'Shlouhim"
        description="Découvrez notre actualité hebdomadaire : paracha, dvar Torah, événements communautaires et fêtes juives. Enrichissez votre pratique spirituelle."
        keywords="paracha semaine, dvar torah, actualités juives, événements communautaires, fêtes juives, spiritualité"
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />
      
      <StructuredData
        type="website"
        data={{}}
      />
      
      <StructuredData
        type="organization"
        data={{}}
      />

      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: 'Accueil', url: '/' },
            { name: 'Actualités' }
          ]
        }}
      />

      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        {/* Header Section */}
        <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Actualités & Paracha de la semaine
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Enrichissez votre spiritualité avec nos articles sur la paracha, 
                nos dvar Torah et l'actualité de la communauté juive
              </p>
            </div>
          </Container>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <Container>
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category.value
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Articles Grid */}
        <section className="py-16">
          <Container>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl aspect-[16/10] mb-4" />
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : currentArticles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentArticles.map((article) => (
                    <article key={article.id} className="group">
                      <Link to={`/news/${article.slug}`} className="block">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group-hover:scale-105">
                          {/* Image */}
                          <div className="relative aspect-[16/10] overflow-hidden">
                            {article.cover_image ? (
                              <img
                                src={article.cover_image}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                                <span className="text-4xl opacity-50">📰</span>
                              </div>
                            )}
                            
                            {/* Category Badge */}
                            <div className="absolute top-4 left-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                                {categories.find(c => c.value === article.category)?.label}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                              {article.title}
                            </h3>
                            
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                              {article.excerpt}
                            </p>

                            {/* Meta Info */}
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(article.published_at)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{article.reading_minutes} min</span>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                            </div>

                            {/* Tags */}
                            {article.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-4">
                                {article.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md"
                                  >
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Précédent
                      </Button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <span className="text-4xl">📝</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Aucun article trouvé
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Essayez de modifier vos filtres ou votre recherche.
                </p>
                <Button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchTerm('');
                  }}
                  variant="outline"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </Container>
        </section>
      </div>
    </>
  );
};
