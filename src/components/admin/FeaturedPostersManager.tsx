import { useState, useEffect } from 'react';
import { Star, StarOff, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Poster } from '../../types';
import { Button } from '../ui/Button';

export const FeaturedPostersManager = () => {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [featuredPosters, setFeaturedPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadPosters();
  }, []);

  const loadPosters = async () => {
    try {
      const { data, error } = await supabase
        .from('posters')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allPosters = data || [];
      // Ajouter is_featured: false par défaut si la propriété n'existe pas
      const postersWithFeatured = allPosters.map(poster => ({
        ...poster,
        is_featured: poster.is_featured || false
      }));
      
      setPosters(postersWithFeatured);
      setFeaturedPosters(postersWithFeatured.filter(p => p.is_featured));
    } catch (error) {
      console.error('Error loading posters:', error);
      alert('Erreur lors du chargement. Vérifiez que la colonne is_featured existe dans la table posters.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (posterId: string, currentFeaturedStatus: boolean) => {
    // Vérifier la limite de 4 affiches favorites avant d'ajouter
    if (!currentFeaturedStatus && featuredPosters.length >= 4) {
      alert('Vous ne pouvez avoir que 4 affiches favorites maximum. Retirez d\'abord une affiche des favorites.');
      return;
    }

    setUpdating(posterId);
    
    try {
      console.log('Tentative de mise à jour:', { posterId, currentFeaturedStatus, newStatus: !currentFeaturedStatus });
      
      const { data, error } = await supabase
        .from('posters')
        .update({ is_featured: !currentFeaturedStatus })
        .eq('id', posterId)
        .select();

      if (error) {
        console.error('Erreur Supabase:', error);
        throw error;
      }

      console.log('Mise à jour réussie:', data);
      
      // Recharger les données
      await loadPosters();
    } catch (error) {
      console.error('Error updating featured status:', error);
      alert(`Erreur lors de la mise à jour: ${error.message}. Vérifiez que la colonne is_featured existe dans la table posters.`);
    } finally {
      setUpdating(null);
    }
  };

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Star className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gérer les Affiches Favorites
          </h2>
        </div>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gérer les Affiches Favorites
          </h2>
        </div>
        <Button
          onClick={loadPosters}
          variant="outline"
          icon={RefreshCw}
          disabled={loading}
        >
          Actualiser
        </Button>
      </div>

      {/* Informations sur les favorites */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-blue-900 dark:text-blue-100">
            Affiches favorites ({featuredPosters.length}/4)
          </span>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Les affiches favorites apparaissent dans le carrousel en haut de la page d'accueil. 
          Vous pouvez sélectionner jusqu'à 4 affiches favorites.
        </p>
      </div>

      {/* Liste des affiches favorites actuelles */}
      {featuredPosters.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Affiches favorites actuelles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredPosters.map((poster) => (
              <div
                key={poster.id}
                className="flex items-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
              >
                <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                  {poster.image_url ? (
                    <img
                      src={poster.image_url}
                      alt={poster.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Eye className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {poster.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {poster.category?.name}
                  </p>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {formatPrice(poster.price_cents, poster.currency)}
                  </span>
                </div>
                <Button
                  onClick={() => toggleFeatured(poster.id, true)}
                  variant="outline"
                  size="sm"
                  disabled={updating === poster.id}
                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-600 dark:hover:bg-yellow-900/20"
                >
                  {updating === poster.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <StarOff className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste de toutes les affiches */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Toutes les affiches ({posters.length})
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {posters.map((poster) => (
            <div
              key={poster.id}
              className={`flex items-center gap-4 p-4 border rounded-lg transition-colors duration-200 ${
                poster.is_featured
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <div className="w-12 h-15 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden flex-shrink-0">
                {poster.image_url ? (
                  <img
                    src={poster.image_url}
                    alt={poster.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Eye className="w-4 h-4" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {poster.title}
                </h4>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{poster.category?.name}</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formatPrice(poster.price_cents, poster.currency)}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => toggleFeatured(poster.id, poster.is_featured)}
                variant={poster.is_featured ? "default" : "outline"}
                size="sm"
                disabled={updating === poster.id || (!poster.is_featured && featuredPosters.length >= 4)}
                className={poster.is_featured ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
              >
                {updating === poster.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : poster.is_featured ? (
                  <Star className="w-4 h-4" />
                ) : (
                  <StarOff className="w-4 h-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
