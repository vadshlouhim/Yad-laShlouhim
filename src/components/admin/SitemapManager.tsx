import { useState, useEffect } from 'react';
import { Download, RefreshCw, ExternalLink, CheckCircle, AlertCircle, BarChart3, Globe, Search, FileText, Image } from 'lucide-react';
import { Button } from '../ui/Button';
import { generateSitemap, downloadSitemap, validateSitemap, submitSitemapToGoogle, analyzeSitemapPerformance, SitemapStats } from '../../utils/sitemap';

export const SitemapManager = () => {
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [stats, setStats] = useState<SitemapStats | null>(null);
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] } | null>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [submittingToGoogle, setSubmittingToGoogle] = useState(false);
  const [googleSubmitted, setGoogleSubmitted] = useState(false);

  useEffect(() => {
    // Charger les stats au démarrage
    loadSitemapStats();
  }, []);

  const loadSitemapStats = async () => {
    try {
      const { content, stats: newStats } = await generateSitemap();
      setStats(newStats);
      
      // Valider le sitemap
      const validationResult = validateSitemap(content);
      setValidation(validationResult);
      
      // Analyser les performances
      const perfAnalysis = await analyzeSitemapPerformance();
      setPerformance(perfAnalysis);
      
    } catch (error) {
      console.error('Error loading sitemap stats:', error);
    }
  };

  const handleGenerateSitemap = async () => {
    setGenerating(true);
    try {
      const downloadStats = await downloadSitemap();
      setStats(downloadStats);
      setLastGenerated(new Date().toLocaleString('fr-FR'));
      
      // Recharger les stats après génération
      await loadSitemapStats();
      
    } catch (error) {
      console.error('Error generating sitemap:', error);
      alert('Erreur lors de la génération du sitemap');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitToGoogle = async () => {
    setSubmittingToGoogle(true);
    try {
      const success = await submitSitemapToGoogle();
      if (success) {
        setGoogleSubmitted(true);
        setTimeout(() => setGoogleSubmitted(false), 5000);
      } else {
        alert('Erreur lors de la soumission à Google');
      }
    } catch (error) {
      console.error('Error submitting to Google:', error);
      alert('Erreur lors de la soumission à Google');
    } finally {
      setSubmittingToGoogle(false);
    }
  };

  const testSitemapAccess = () => {
    window.open('https://yad-lashlouhim.com/sitemap.xml', '_blank');
  };

  const openGoogleSearchConsole = () => {
    window.open('https://search.google.com/search-console', '_blank');
  };

  const openSitemapValidator = () => {
    window.open('https://www.xml-sitemaps.com/validate-xml-sitemap.html', '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header avec stats rapides */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestionnaire de Sitemap Avancé
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadSitemapStats}
              variant="outline"
              icon={RefreshCw}
              size="sm"
            >
              Actualiser
            </Button>
          </div>
        </div>

        {/* Stats rapides */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalUrls}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">URLs totales</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.staticPages}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Pages statiques</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.newsArticles}</div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Articles</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.categories}</div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Catégories</div>
            </div>
          </div>
        )}

        {/* Status de validation */}
        {validation && (
          <div className={`p-4 rounded-lg border ${
            validation.isValid 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {validation.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`font-medium ${
                validation.isValid 
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {validation.isValid ? 'Sitemap valide ✅' : 'Erreurs détectées ❌'}
              </span>
            </div>
            {validation.errors.length > 0 && (
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Actions principales */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actions du sitemap
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={handleGenerateSitemap}
            loading={generating}
            icon={Download}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {generating ? 'Génération...' : 'Générer & Télécharger'}
          </Button>
          
          <Button
            onClick={testSitemapAccess}
            variant="outline"
            icon={ExternalLink}
          >
            Tester l'accès public
          </Button>
          
          <Button
            onClick={handleSubmitToGoogle}
            loading={submittingToGoogle}
            icon={Search}
            className={`${googleSubmitted ? 'bg-green-600' : 'bg-blue-600'} hover:bg-blue-700 text-white border-0`}
          >
            {submittingToGoogle ? 'Soumission...' : googleSubmitted ? 'Soumis ✅' : 'Soumettre à Google'}
          </Button>
          
          <Button
            onClick={openSitemapValidator}
            variant="outline"
            icon={FileText}
          >
            Valider XML
          </Button>
        </div>

        {lastGenerated && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Dernière génération: {lastGenerated}
          </div>
        )}
      </div>

      {/* Analyse des performances */}
      {performance && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Analyse des performances SEO
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distribution des fréquences de changement */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Fréquences de mise à jour
              </h4>
              <div className="space-y-2">
                {Object.entries(performance.changefreqDistribution).map(([freq, count]) => (
                  <div key={freq} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{freq}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(count / performance.totalUrls) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Métriques générales */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Métriques SEO
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Priorité moyenne</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{performance.avgPriority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">URLs avec images</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.newsArticles || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Dernière mise à jour</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date().toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Google Search Console */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-6 h-6 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configuration Google Search Console
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instructions étape par étape */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              📋 Étapes de configuration
            </h4>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li><strong>1.</strong> Ouvrez Google Search Console</li>
              <li><strong>2.</strong> Sélectionnez votre propriété "yad-lashlouhim.com"</li>
              <li><strong>3.</strong> Menu: Indexation → Sitemaps</li>
              <li><strong>4.</strong> Cliquez "Ajouter un sitemap"</li>
              <li><strong>5.</strong> Entrez: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">sitemap.xml</code></li>
              <li><strong>6.</strong> Cliquez "Envoyer"</li>
            </ol>
          </div>

          {/* URLs du sitemap */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              🔗 URLs du sitemap
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">Production:</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                  https://yad-lashlouhim.com/sitemap.xml
                </code>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Fonction Netlify:</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                  /.netlify/functions/sitemap
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Button
            onClick={openGoogleSearchConsole}
            variant="outline"
            icon={ExternalLink}
            className="bg-blue-600 hover:bg-blue-700 text-white border-0"
          >
            Ouvrir Search Console
          </Button>
          
          <Button
            onClick={openSitemapValidator}
            variant="outline"
            icon={FileText}
          >
            Validateur XML
          </Button>
        </div>
      </div>

      {/* Optimisations SEO */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Optimisations SEO intégrées
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              ✅ Fonctionnalités avancées
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Support des images (image:image)</li>
              <li>• Métadonnées complètes (lastmod, priority, changefreq)</li>
              <li>• URLs canoniques et HTTPS uniquement</li>
              <li>• Validation XML automatique</li>
              <li>• Compression et cache optimisés</li>
              <li>• Soumission automatique à Google</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              📊 Contenu dynamique
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Articles de news avec images</li>
              <li>• Catégories d'affiches</li>
              <li>• Pages d'affiches individuelles</li>
              <li>• Mise à jour automatique du contenu</li>
              <li>• Gestion des dates de modification</li>
              <li>• Priorités SEO optimisées</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Monitoring et conseils */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            💡 Conseils pour l'indexation optimale
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              🚀 Bonnes pratiques
            </h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Soumettez le sitemap après chaque mise à jour majeure</li>
              <li>• Vérifiez les erreurs dans Search Console chaque semaine</li>
              <li>• Maintenez les URLs actives et accessibles</li>
              <li>• Utilisez des URLs canoniques cohérentes</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              ⏱️ Délais d'indexation
            </h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Nouvelles pages: 1-7 jours</li>
              <li>• Mises à jour: 1-3 jours</li>
              <li>• Articles de news: Quelques heures</li>
              <li>• Vérification complète: 2-4 semaines</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>🎯 Objectif:</strong> Améliorer la visibilité de vos affiches dans les résultats de recherche Google 
            pour "affiches communautaires juives", "templates canva événements", "invitations shabbat", etc.
          </p>
        </div>
      </div>

      {/* Outils externes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🛠️ Outils externes recommandés
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Search className="w-6 h-6 text-blue-500" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Google Search Console</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Monitoring officiel</div>
            </div>
          </a>

          <a
            href="https://www.xml-sitemaps.com/validate-xml-sitemap.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <FileText className="w-6 h-6 text-green-500" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Validateur XML</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Vérification syntaxe</div>
            </div>
          </a>

          <a
            href="https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <ExternalLink className="w-6 h-6 text-purple-500" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Documentation Google</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Guide officiel</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};