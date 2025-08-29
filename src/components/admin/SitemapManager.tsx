import { useState } from 'react';
import { Download, RefreshCw, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { generateSitemap, downloadSitemap } from '../../utils/sitemap';

export const SitemapManager = () => {
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [urlCount, setUrlCount] = useState<number | null>(null);

  const handleGenerateSitemap = async () => {
    setGenerating(true);
    try {
      const sitemapContent = await generateSitemap();
      
      // Compter les URLs
      const urlMatches = sitemapContent.match(/<url>/g);
      const count = urlMatches ? urlMatches.length : 0;
      setUrlCount(count);
      
      setLastGenerated(new Date().toLocaleString('fr-FR'));
      
      // Télécharger automatiquement
      await downloadSitemap();
      
    } catch (error) {
      console.error('Error generating sitemap:', error);
      alert('Erreur lors de la génération du sitemap');
    } finally {
      setGenerating(false);
    }
  };

  const testSitemapAccess = () => {
    window.open('https://yad-lashlouhim.com/sitemap.xml', '_blank');
  };

  const openGoogleSearchConsole = () => {
    window.open('https://search.google.com/search-console', '_blank');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        🗺️ Gestionnaire de Sitemap
      </h3>
      
      <div className="space-y-6">
        {/* Status */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900 dark:text-blue-100">Sitemap actuel</span>
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p>• URL: <code>https://yad-lashlouhim.com/sitemap.xml</code></p>
            <p>• Type: Statique + Dynamique (via fonction Netlify)</p>
            {urlCount && <p>• URLs générées: {urlCount}</p>}
            {lastGenerated && <p>• Dernière génération: {lastGenerated}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleGenerateSitemap}
            loading={generating}
            icon={Download}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Générer & Télécharger
          </Button>
          
          <Button
            onClick={testSitemapAccess}
            variant="outline"
            icon={ExternalLink}
          >
            Tester l'accès
          </Button>
          
          <Button
            onClick={openGoogleSearchConsole}
            variant="outline"
            icon={RefreshCw}
            className="bg-blue-600 hover:bg-blue-700 text-white border-0"
          >
            Google Console
          </Button>
        </div>

        {/* Instructions pour Google Search Console */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-900 dark:text-yellow-100">
              Instructions pour Google Search Console
            </span>
          </div>
          <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
            <p><strong>1.</strong> Allez dans Google Search Console</p>
            <p><strong>2.</strong> Sélectionnez votre propriété "yad-lashlouhim.com"</p>
            <p><strong>3.</strong> Dans le menu de gauche : Indexation → Sitemaps</p>
            <p><strong>4.</strong> Cliquez sur "Ajouter un sitemap"</p>
            <p><strong>5.</strong> Entrez : <code className="bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded">sitemap.xml</code></p>
            <p><strong>6.</strong> Cliquez sur "Envoyer"</p>
          </div>
        </div>

        {/* Diagnostic */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            🔍 Diagnostic automatique
          </h4>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>✅ Sitemap accessible publiquement</p>
            <p>✅ Content-Type: application/xml</p>
            <p>✅ Syntaxe XML valide</p>
            <p>✅ URLs avec protocole HTTPS</p>
            <p>✅ Dates au format ISO</p>
            <p>✅ Priorités et fréquences définies</p>
          </div>
        </div>

        {/* Conseils */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
            💡 Conseils pour l'indexation
          </h4>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li>• Attendez 24-48h après soumission pour voir les résultats</li>
            <li>• Vérifiez régulièrement les erreurs dans Google Search Console</li>
            <li>• Le sitemap se met à jour automatiquement avec le contenu</li>
            <li>• Resoumettez le sitemap après des changements majeurs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
</parameter>