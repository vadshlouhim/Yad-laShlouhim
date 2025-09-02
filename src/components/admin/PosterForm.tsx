import { useState, useEffect } from 'react';
import { Save, X, Upload, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { adminOperations } from '../../lib/adminOperations';
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
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('url');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    image_url: '',
    price_cents: 0,
    currency: 'EUR',
    canva_link: '',
    is_published: false,
    is_featured: false
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
        is_published: poster.is_published,
        is_featured: poster.is_featured || false
      });
      // Détecter automatiquement le mode d'image
      if (poster.image_url) {
        setImageMode(poster.image_url.includes('supabase') ? 'upload' : 'url');
      }
    }
  }, [poster]);

  const loadCategories = async () => {
    setLoadingCategories(true);
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
        setErrors(prev => ({ ...prev, categories: `Erreur lors du chargement des catégories: ${error.message}` }));
        return;
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ Aucune catégorie trouvée dans la base de données');
        setErrors(prev => ({ ...prev, categories: 'Aucune catégorie disponible. Créez d\'abord des catégories dans l\'onglet Catégories.' }));
      }

      setCategories(data || []);
      console.log('✅ Catégories chargées:', data?.length || 0, 'catégories');
    } catch (error) {
      console.error('❌ Erreur générale lors du chargement des catégories:', error);
      setErrors(prev => ({ ...prev, categories: 'Erreur lors du chargement des catégories' }));
    } finally {
      setLoadingCategories(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Veuillez sélectionner une catégorie';
    }
    
    if (!formData.image_url.trim()) {
      newErrors.image_url = 'Une image est requise';
    }
    
    if (formData.price_cents <= 0) {
      newErrors.price_cents = 'Le prix doit être supérieur à 0';
    }
    
    if (!formData.canva_link.trim()) {
      newErrors.canva_link = 'Le lien Canva est requis';
    } else if (!formData.canva_link.includes('canva.com')) {
      newErrors.canva_link = 'Le lien doit être un lien Canva valide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      console.log('💾 Sauvegarde de l\'affiche via Edge Function:', formData);
      
      if (poster) {
        console.log('🔄 Modification de l\'affiche:', poster.id);
        await adminOperations.updatePoster(poster.id, formData);
      } else {
        console.log('➕ Création d\'une nouvelle affiche');
        await adminOperations.createPoster(formData);
      }

      console.log('✅ Sauvegarde réussie');
      onSave();
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      setErrors(prev => ({ ...prev, submit: `Erreur lors de la sauvegarde: ${error.message || error}` }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
                {loadingCategories ? 'Chargement des catégories...' : `Catégories disponibles: ${categories.length}`}
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  console.log('=== DEBUG POSTER FORM ===');
                  console.log('Categories:', categories);
                  console.log('Form data:', formData);
                  console.log('Errors:', errors);
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

          {/* Affichage des erreurs globales */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800 dark:text-red-200">Erreur</span>
              </div>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">{errors.submit}</p>
            </div>
          )}

          {errors.categories && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800 dark:text-yellow-200">Attention</span>
              </div>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">{errors.categories}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                  placeholder="Titre de votre affiche"
                />
                {errors.title && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie <span className="text-red-500">*</span>
                  {!loadingCategories && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({categories.length} disponible{categories.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                    errors.category_id ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                  disabled={loadingCategories || categories.length === 0}
                >
                  <option value="">
                    {loadingCategories ? 'Chargement...' : categories.length === 0 ? 'Aucune catégorie disponible' : 'Sélectionner une catégorie'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.category_id}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                required
                placeholder="Description de votre affiche"
              />
              {errors.description && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Gestion de l'image - Upload ou URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Image de l'affiche <span className="text-red-500">*</span>
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
                    onImageUploaded={(url) => handleInputChange('image_url', url)}
                  />
                </div>
              )}

              {/* Mode URL */}
              {imageMode === 'url' && (
                <div className="space-y-3">
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                      errors.image_url ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
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

              {errors.image_url && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.image_url}</p>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prix (en centimes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price_cents}
                  onChange={(e) => handleInputChange('price_cents', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                    errors.price_cents ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  min="1"
                  required
                  placeholder="3800 (pour 38€)"
                />
                {errors.price_cents && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.price_cents}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Prix en centimes (ex: 3800 = 38,00€)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Devise
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Aperçu du prix
                </label>
                <div className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: formData.currency,
                  }).format(formData.price_cents / 100)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lien Canva <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.canva_link}
                onChange={(e) => handleInputChange('canva_link', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                  errors.canva_link ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="https://www.canva.com/design/..."
                required
              />
              {errors.canva_link && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.canva_link}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Lien de partage Canva que recevront les clients
              </p>
            </div>

            {/* Options de publication et favoris */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => handleInputChange('is_published', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_published" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    📢 Publier l'affiche (visible sur le site)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    className="w-4 h-4 text-yellow-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-yellow-500"
                  />
                  <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    ⭐ Affiche favorite (carrousel d'accueil)
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  💡 Conseils
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Publiez d'abord l'affiche avant de la mettre en favori</li>
                  <li>• Maximum 4 affiches favorites autorisées</li>
                  <li>• Les favorites apparaissent sur la page d'accueil</li>
                </ul>
              </div>
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