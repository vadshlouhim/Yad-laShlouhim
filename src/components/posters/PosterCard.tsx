import { useState } from 'react';
import { ShoppingBag, Tag } from 'lucide-react';
import { Poster } from '../../types';
import { Button } from '../ui/Button';

interface PosterCardProps {
  poster: Poster;
  onPurchase: (posterId: string) => void;
}

export const PosterCard = ({ poster, onPurchase }: PosterCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      await onPurchase(poster.id);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {!imageError ? (
          <img
            src={poster.image_url}
            alt={poster.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Tag size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aperçu indisponible</p>
            </div>
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            {formatPrice(poster.price_cents, poster.currency)}
          </div>
        </div>

        {/* Category Badge */}
        {poster.category && (
          <div className="absolute top-3 left-3">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-xs font-medium">
              {poster.category.name}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {poster.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
          {poster.description}
        </p>

        {/* Info Banner */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            <strong>La personnalisation se fait sur Canva via ce lien.</strong> Mise en page préservée.
          </p>
        </div>

        {/* Purchase Button */}
        <Button
          onClick={handlePurchase}
          loading={isLoading}
          icon={ShoppingBag}
          size="lg"
          className="w-full"
        >
          Acheter l'affiche
        </Button>
      </div>
    </div>
  );
};