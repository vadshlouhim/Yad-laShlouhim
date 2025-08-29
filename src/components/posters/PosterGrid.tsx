import { Poster } from '../../types';
import { PosterCard } from './PosterCard';

interface PosterGridProps {
  posters: Poster[];
  onPurchase: (posterId: string) => void;
  loading?: boolean;
}

export const PosterGrid = ({ posters, onPurchase, loading = false }: PosterGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl aspect-[4/5] mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posters.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {posters.map((poster) => (
        <PosterCard
          key={poster.id}
          poster={poster}
          onPurchase={onPurchase}
        />
      ))}
    </div>
  );
};