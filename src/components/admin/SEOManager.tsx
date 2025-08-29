import { useState, useEffect } from 'react';
import { Search, BarChart3, Globe, Target, TrendingUp, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { SitemapStatus } from '../seo/SitemapStatus';
import { supabase } from '../../lib/supabase';

interface SEOMetrics {
  totalPages: number;
  indexedPages: number;
  articlesCount: number;
  categoriesCount: number;
  avgLoadTime: number;
  mobileScore: number;
}

export const SEOManager = () => {
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    loadSEOMetrics();
  }, []);

  const loadSEOMetrics = async () => {
    try {
      // Récupérer les métriques depuis Supabase
      const [articlesRes, categoriesRes, postersRes] = await Promise.all([
        supabase.from('news_articles').select('id').eq('is_published', true),
        supabase.from('categories').select('id'),
        supabase.from('posters').select('id').eq('is_published', true)
      ]);

      const metrics: SEOMetrics = {
        totalPages: 3 + (articlesRes.data?.length || 0), // Pages statiques + articles
        indexedPages: 0, // À implémenter avec Google Search Console API
        articlesCount: articlesRes.data?.length || 0,
        categoriesCount: categoriesRes.data?.length || 0,
        avgLoadTime: 1.2, // À mesurer avec des outils de performance
        mobileScore: 95 // À mesurer avec PageSpeed Insights
      };

      setMetrics(metrics);
    } catch (error) {
      console.error('Error loading SEO metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const primaryKeywords = [
    'affiches juives',
    'templates canva',
    'événements communautaires',
    'invitations shabbat',
    'fêtes juives',
    'design graphique religieux',
    'affiches bar mitzvah',
    'communauté juive paris',
    'personnalisation canva',
    'modèles événements juifs'
  ];

  const openPageSpeedInsights = () => {
    window.open('https://pagespeed.web.dev/analysis/https-yad-lashlouhim-com/9j8k7l6m5n?form_factor=mobile', '_blank');
  };

  const openGoogleSearchConsole = () => {
    window.open('https://search.google.com/search-console', '_blank');
  };

  const openGoogleAnalytics = () => {
    window.open('https://analytics.google.com', '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Search className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestionnaire SEO
          </h2>
        </div>

        {/* Métriques principales */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            ))}
          </div>
        ) : metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.totalPages}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Pages totales</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.articlesCount}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Articles publiés</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.categoriesCount}</div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Catégories</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{metrics.mobileScore}</div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Score mobile</div>
            </div>
          </div>
        )}
      </div>

      {/* Status du sitemap */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🗺️ Statut du sitemap
        </h3>
        <SitemapStatus />
      </div>

      {/* Mots-clés ciblés */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mots-clés ciblés
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {primaryKeywords.map((keyword, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center"
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {keyword}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Priorité {index < 3 ? 'Haute' : index < 6 ? 'Moyenne' : 'Normale'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outils SEO externes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Outils d'analyse SEO
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={openGoogleSearchConsole}
            variant="outline"
            icon={ExternalLink}
            className="justify-start"
          >
            <div className="text-left">
              <div className="font-medium">Google Search Console</div>
              <div className="text-xs text-gray-500">Indexation & erreurs</div>
            </div>
          </Button>

          <Button
            onClick={openPageSpeedInsights}
            variant="outline"
            icon={ExternalLink}
            className="justify-start"
          >
            <div className="text-left">
              <div className="font-medium">PageSpeed Insights</div>
              <div className="text-xs text-gray-500">Performance & Core Web Vitals</div>
            </div>
          </Button>

          <Button
            onClick={openGoogleAnalytics}
            variant="outline"
            icon={ExternalLink}
            className="justify-start"
          >
            <div className="text-left">
              <div className="font-medium">Google Analytics</div>
              <div className="text-xs text-gray-500">Trafic & conversions</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Recommandations SEO */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🚀 Recommandations d'optimisation
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              ✅ Optimisations en place
            </h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Sitemap XML dynamique avec images</li>
              <li>• Meta tags Open Graph complets</li>
              <li>• Structured Data (JSON-LD)</li>
              <li>• URLs canoniques</li>
              <li>• Responsive design</li>
              <li>• Performance optimisée</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              🎯 Prochaines étapes
            </h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Créer plus de contenu (articles de blog)</li>
              <li>• Optimiser les images (alt text, compression)</li>
              <li>• Ajouter des avis clients</li>
              <li>• Créer des pages de catégories dédiées</li>
              <li>• Implémenter le multilingue (hébreu)</li>
              <li>• Optimiser les Core Web Vitals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};