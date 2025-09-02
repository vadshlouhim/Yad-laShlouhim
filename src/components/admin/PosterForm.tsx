import { useState, useEffect } from 'react';
import { Save, X, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Category, Poster } from '../../types';
import { Button } from '../ui/Button';
import { ImageUpload } from './ImageUpload';

interface PosterFormProps {
  poster?: Poster;
  onSave: () => void;
  onCancel: () => void;
}

export const PosterForm = ({ poster, onSave, onCancel }: PosterFormProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('url');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    image_url: '',
    price_cents: 0,
    currency: 'EUR',
    canva_link: '',
    is_published: false
  });

  useEffect(() => {
    loadCategories();
    if (poster) {
      setFormData({
        title: poster.title,
        description: poster.description,
        category_id: poster.category_id,
        image_url: poster.image_url,
        price_cents: poster.price_cents,
        currency: poster.currency,
        canva_link: poster.canva_link,
        is_published: poster.is_published
      });
    }
  }, [poster]);

  const loadCategories = async () => {
    try {
      console.log('🔍 Chargement des catégories...');
      
      if (!supabase) {
        throw new Error('Supabase n\'est pas configuré');
      }
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      console.log('Catégories reçues:', data);
      console.log('Erreur catégories:', error);

      if (error) {
        console.error('❌ Erreur lors du chargement des catégories:', error);
        alert(`Erreur lors du chargement des catégories: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ Aucune catégorie trouvée dans la base de données');
        alert('Aucune catégorie disponible. Créez d\'abord des catégories.');
      }

      setCategories(data || []);
      console.log('✅ Catégories chargées:', data?.length || 0, 'catégories');
    } catch (error) {
      console.error('❌ Erreur générale lors du chargement des catégories:', error);
      alert('Erreur lors du chargement des catégories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase n\'est pas configuré');
      }
      
      console.log('💾 Sauvegarde de l\'affiche:', formData);
      
      if (poster) {
        console.log('🔄 Modification de l\'affiche:', poster.id);
        const { error } = await supabase
          .from('posters')
          .update(formData)
          .eq('id', poster.id);
        if (error) throw error;
      } else {
        console.log('➕ Création d\'une nouvelle affiche');
        const { error } = await supabase
          .from('posters')
          .insert([formData]);
        if (error) throw error;
      }

      console.log('✅ Sauvegarde réussie');
      onSave();
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      alert(`Erreur lors de la sauvegarde: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {poster ? 'Modifier l\'affiche' : 'Nouvelle affiche'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Catégories chargées: {categories.length}
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  console.log('=== DEBUG POSTER FORM ===');
                  console.log('Categories:', categories);
                  console.log('Form data:', formData);
                  loadCategories(); // Recharger les catégories
                }}
                className="px-2 sm:px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30"
              >
                <span className="hidden sm:inline">Debug</span>
                <span className="sm:hidden">🐛</span>
              </button>
              <button
                onClick={onCancel}
                className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie ({categories.length} disponible{categories.length !== 1 ? 's' : ''})
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={categories.length === 0}
                >
                  <option value="">
                    {categories.length === 0 ? 'Aucune catégorie disponible' : 'Sélectionner une catégorie'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} (ID: {category.id})
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    ⚠️ Aucune catégorie trouvée. Créez d'abord des catégories dans l'onglet "Catégories".
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Gestion de l'image - Upload ou URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Image de l'affiche
              </label>
              
              {/* Onglets Upload/URL */}
              <div className="mb-4">
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors duration-200 ${
                      imageMode === 'upload'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="hidden sm:inline">📤 Upload d'image</span>
                    <span className="sm:hidden">📤 Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors duration-200 ${
                      imageMode === 'url'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="hidden sm:inline">🔗 URL d'image</span>
                    <span className="sm:hidden">🔗 URL</span>
                  </button>
                </div>
              </div>

              {/* Mode Upload */}
              {imageMode === 'upload' && (
                <div>
                  <ImageUpload
                    currentImageUrl={formData.image_url}
                    onImageUploaded={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                  />
                </div>
              )}

              {/* Mode URL */}
              {imageMode === 'url' && (
                <div className="space-y-3">
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {/* Aperçu de l'image si URL valide */}
                  {formData.image_url && (
                    <div className="relative">
                      <div className="relative aspect-[4/5] max-w-xs mx-auto bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                        <img
                          src={formData.image_url}
                          alt="Aperçu de l'image"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                          <div className="text-center text-gray-500 dark:text-gray-400">
                            <div className="w-12 h-12 mx-auto mb-2">❌</div>
                            <p className="text-sm">Image non accessible</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        Aperçu de l'image depuis l'URL
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Aperçu de l'image actuelle */}
              {formData.image_url && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">URL de l'image actuelle:</p>
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                    {formData.image_url}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prix (en centimes)
                </label>
                <input
                  type="number"
                  value={formData.price_cents}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_cents: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lien Canva
              </label>
              <input
                type="url"
                value={formData.canva_link}
                onChange={(e) => setFormData(prev => ({ ...prev, canva_link: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.canva.com/design/..."
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_published" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Publier l'affiche
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" loading={loading} icon={Save} size="sm" className="order-1 sm:order-none">
                <span className="hidden sm:inline">{poster ? 'Modifier' : 'Créer'}</span>
                <span className="sm:hidden">{poster ? 'Modif' : 'Créer'}</span>
              </Button>
              <Button type="button" variant="ghost" onClick={onCancel} size="sm" className="order-2 sm:order-none">
                Annuler
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};