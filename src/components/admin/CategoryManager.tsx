import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Calendar, Moon, PartyPopper, Users, BookOpen, Gift, Heart, Star, Sparkles, Crown, Zap, Music, Camera, Palette } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types';
import { Button } from '../ui/Button';

export const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', icon: '' });
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Icônes prédéfinies avec couleurs harmonieuses
  const availableIcons = [
    { icon: Calendar, name: 'Calendar', color: 'from-blue-500 to-blue-600' },
    { icon: Moon, name: 'Moon', color: 'from-indigo-500 to-purple-600' },
    { icon: PartyPopper, name: 'PartyPopper', color: 'from-pink-500 to-red-500' },
    { icon: Users, name: 'Users', color: 'from-green-500 to-emerald-600' },
    { icon: BookOpen, name: 'BookOpen', color: 'from-orange-500 to-amber-600' },
    { icon: Gift, name: 'Gift', color: 'from-purple-500 to-pink-600' },
    { icon: Heart, name: 'Heart', color: 'from-red-500 to-pink-500' },
    { icon: Star, name: 'Star', color: 'from-yellow-500 to-orange-500' },
    { icon: Sparkles, name: 'Sparkles', color: 'from-purple-500 to-blue-600' },
    { icon: Crown, name: 'Crown', color: 'from-yellow-500 to-yellow-600' },
    { icon: Zap, name: 'Zap', color: 'from-blue-500 to-cyan-500' },
    { icon: Music, name: 'Music', color: 'from-violet-500 to-purple-600' },
    { icon: Camera, name: 'Camera', color: 'from-gray-500 to-gray-600' },
    { icon: Palette, name: 'Palette', color: 'from-teal-500 to-cyan-600' }
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      console.log('🔍 Chargement des catégories depuis Supabase...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Catégories reçues:', data);
      console.log('Erreur catégories:', error);

      if (error) {
        console.error('❌ Erreur lors du chargement des catégories:', error);
        alert(`Erreur lors du chargement des catégories: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ Aucune catégorie trouvée dans la base de données');
        console.log('💡 Vérifiez que la migration a été appliquée');
      }

      setCategories(data || []);
      console.log('✅ Catégories chargées:', data?.length || 0, 'catégories');
    } catch (error) {
      console.error('❌ Erreur générale lors du chargement des catégories:', error);
      alert('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([formData]);
        if (error) throw error;
      }

      setFormData({ name: '', slug: '', icon: '' });
      setEditingId(null);
      setShowIconPicker(false);
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon
    });
    setEditingId(category.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des catégories...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Catégories
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {categories.length} catégorie{categories.length !== 1 ? 's' : ''} chargée{categories.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              console.log('=== DEBUG CATEGORY MANAGER ===');
              console.log('Categories state:', categories);
              loadCategories(); // Recharger les catégories
            }}
            className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30"
          >
            Debug
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  name,
                  slug: generateSlug(name)
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Icône (Lucide)
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Calendar"
              required
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button type="submit" icon={Save}>
            {editingId ? 'Modifier' : 'Ajouter'}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="ghost"
              icon={X}
              onClick={() => {
                setEditingId(null);
                setFormData({ name: '', slug: '', icon: '' });
              }}
            >
              Annuler
            </Button>
          )}
        </div>
      </form>

      {/* Categories List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Icône
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {category.icon}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};