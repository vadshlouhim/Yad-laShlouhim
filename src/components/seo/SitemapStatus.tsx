import { useState, useEffect } from 'react';
import { Globe, CheckCircle, XCircle, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

interface SitemapStatusProps {
  className?: string;
}

export const SitemapStatus = ({ className = '' }: SitemapStatusProps) => {
  const [status, setStatus] = useState<'checking' | 'accessible' | 'error' | 'not-found'>('checking');
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [urlCount, setUrlCount] = useState<number | null>(null);

  useEffect(() => {
    checkSitemapStatus();
  }, []);

  const checkSitemapStatus = async () => {
    setStatus('checking');
    
    try {
      // Tester l'accès au sitemap
      const response = await fetch('https://yad-lashlouhim.com/sitemap.xml', {
        method: 'HEAD', // Plus rapide que GET
        cache: 'no-cache'
      });

      if (response.ok) {
        setStatus('accessible');
        
        // Essayer de compter les URLs (GET cette fois)
        try {
          const fullResponse = await fetch('https://yad-lashlouhim.com/sitemap.xml');
          const content = await fullResponse.text();
          const urlMatches = content.match(/<url>/g);
          setUrlCount(urlMatches ? urlMatches.length : 0);
        } catch (countError) {
          console.log('Could not count URLs:', countError);
        }
      } else if (response.status === 404) {
        setStatus('not-found');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Sitemap check failed:', error);
      setStatus('error');
    }
    
    setLastCheck(new Date().toLocaleString('fr-FR'));
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'accessible':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'not-found':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'accessible':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'not-found':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'checking':
        return 'Vérification du sitemap...';
      case 'accessible':
        return `Sitemap accessible${urlCount ? ` (${urlCount} URLs)` : ''}`;
      case 'error':
        return 'Erreur d\'accès au sitemap';
      case 'not-found':
        return 'Sitemap non trouvé (404)';
      default:
        return 'Statut inconnu';
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'checking':
        return 'text-blue-700 dark:text-blue-300';
      case 'accessible':
        return 'text-green-700 dark:text-green-300';
      case 'error':
        return 'text-red-700 dark:text-red-300';
      case 'not-found':
        return 'text-yellow-700 dark:text-yellow-300';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg ${getStatusColor()} ${className}`}>
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div>
          <p className={`font-medium ${getTextColor()}`}>
            Statut du sitemap
          </p>
          <p className={`text-sm ${getTextColor()}`}>
            {getStatusMessage()}
          </p>
          {lastCheck && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Dernière vérification: {lastCheck}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={checkSitemapStatus}
          variant="outline"
          size="sm"
          disabled={status === 'checking'}
        >
          Vérifier
        </Button>
        
        <Button
          onClick={() => window.open('https://yad-lashlouhim.com/sitemap.xml', '_blank')}
          variant="outline"
          size="sm"
          icon={ExternalLink}
        >
          Voir
        </Button>
      </div>
    </div>
  );
};