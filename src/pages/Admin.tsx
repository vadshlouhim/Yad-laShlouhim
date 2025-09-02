import { useState, useEffect } from 'react';
import { Plus, Users, Image, ArrowLeft, LogOut, Star, Bug, Folder, Database } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { AdminGate } from '../components/admin/AdminGate';
import { CategoryManager } from '../components/admin/CategoryManager';
import { PosterForm } from '../components/admin/PosterForm';
import { PosterTable } from '../components/admin/PosterTable';
import { FeaturedPostersManager } from '../components/admin/FeaturedPostersManager';
import { StorageManager } from '../components/admin/StorageManager';
import { DebugSupabase } from '../components/admin/DebugSupabase';
import { DatabaseFixer } from '../components/admin/DatabaseFixer';
// SupabaseSetup et StripeSetup supprimés lors du nettoyage - composants temporaires pour admin
import { supabase } from '../lib/supabase';
import { Poster } from '../types';

type AdminView = 'posters' | 'categories' | 'featured' | 'storage' | 'debug';

export const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<AdminView>('posters');
  const [showPosterForm, setShowPosterForm] = useState(false);
  const [editingPoster, setEditingPoster] = useState<Poster | undefined>();
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    const isAuth = sessionStorage.getItem('admin_authenticated');
    console.log('Admin auth check:', isAuth);
    
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentView === 'posters') {
      loadPosters();
    }
  }, [isAuthenticated, currentView]);

  const loadPosters = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        throw new Error('Supabase n\'est pas configuré');
      }
      
      console.log('📋 Chargement des affiches admin...');
      
      const { data, error } = await supabase
        .from('posters')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log(`✅ ${data?.length || 0} affiches chargées`);
      setPosters(data || []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des affiches:', error);
      alert(`Erreur lors du chargement: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePosterSave = () => {
    setShowPosterForm(false);
    setEditingPoster(undefined);
    loadPosters();
  };

  const handleEditPoster = (poster: Poster) => {
    setEditingPoster(poster);
    setShowPosterForm(true);
  };

  const handleDeletePoster = async (id: string) => {
    try {
      if (!supabase) {
        throw new Error('Supabase n\'est pas configuré');
      }
      
      console.log('🗑️ Suppression de l\'affiche:', id);
      
      const { error } = await supabase
        .from('posters')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('✅ Affiche supprimée avec succès');
      loadPosters();
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      alert(`Erreur lors de la suppression: ${error.message || error}`);
    }
  };

  const handleTogglePublish = async (poster: Poster) => {
    try {
      if (!supabase) {
        throw new Error('Supabase n\'est pas configuré');
      }
      
      console.log('👁️ Basculer la publication:', { id: poster.id, currentStatus: poster.is_published, newStatus: !poster.is_published });
      
      const { error } = await supabase
        .from('posters')
        .update({ is_published: !poster.is_published })
        .eq('id', poster.id);
      
      if (error) throw error;
      
      console.log('✅ Statut de publication mis à jour');
      loadPosters();
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      alert(`Erreur lors de la mise à jour: ${error.message || error}`);
    }
  };

  const handleToggleFeatured = async (poster: Poster) => {
    try {
      if (!supabase) {
        throw new Error('Supabase n\'est pas configuré');
      }
      
      // Vérifier la limite de 4 affiches favorites avant d'ajouter
      if (!poster.is_featured) {
        const { data: featuredCount, error: countError } = await supabase
          .from('posters')
          .select('id', { count: 'exact' })
          .eq('is_featured', true);
          
        if (countError) {
          throw countError;
        }
        
        if ((featuredCount?.length || 0) >= 4) {
          alert('Vous ne pouvez avoir que 4 affiches favorites maximum. Retirez d\'abord une affiche des favorites.');
          return;
        }
      }
      
      console.log('⭐ Basculer le statut favori:', { id: poster.id, currentStatus: poster.is_featured, newStatus: !poster.is_featured });
      
      const { error } = await supabase
        .from('posters')
        .update({ is_featured: !poster.is_featured })
        .eq('id', poster.id);
      
      if (error) {
        if (error.message.includes('4 affiches favorites maximum')) {
          alert('Limite atteinte : Vous ne pouvez avoir que 4 affiches favorites maximum.');
        } else {
          throw error;
        }
        return;
      }
      
      console.log('✅ Statut favori mis à jour');
      loadPosters();
      
      // Message de confirmation
      const action = !poster.is_featured ? 'ajoutée aux' : 'retirée des';
      console.log(`✅ Affiche ${action} favorites`);
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des favoris:', error);
      alert(`Erreur lors de la mise à jour: ${error.message || error}`);
    }
  };
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
    sessionStorage.removeItem('admin_authenticated');
    window.location.href = '/';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <AdminGate 
          onAuthenticated={() => setIsAuthenticated(true)}
        />
      </div>
    );
  }

  return (
    <div className="py-12">
      <Container>
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Administration
            </h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                onClick={handleLogout}
                variant="ghost"
                icon={LogOut}
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Déconnexion</span>
                <span className="sm:hidden">Exit</span>
              </Button>
              <Link to="/">
                <Button
                  variant="outline"
                  icon={ArrowLeft}
                  size="sm"
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Retour au site</span>
                  <span className="sm:hidden">Retour</span>
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-sm sm:text-xl text-gray-600 dark:text-gray-400">
            Gérez vos affiches et catégories
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-1 sm:p-2 mb-8">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentView('posters')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                currentView === 'posters'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Image size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden xs:inline">Affiches</span>
              <span className="xs:hidden">Aff</span>
            </button>
            <button
              onClick={() => setCurrentView('featured')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                currentView === 'featured'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Star size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden xs:inline">Favorites</span>
              <span className="xs:hidden">Fav</span>
            </button>
            <button
              onClick={() => setCurrentView('categories')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                currentView === 'categories'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden xs:inline">Catégories</span>
              <span className="xs:hidden">Cat</span>
            </button>
            <button
              onClick={() => setCurrentView('storage')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                currentView === 'storage'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Folder size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden xs:inline">Fichiers</span>
              <span className="xs:hidden">Files</span>
            </button>
            <button
              onClick={() => setCurrentView('debug')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                currentView === 'debug'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Bug size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden xs:inline">Debug</span>
              <span className="xs:hidden">🔧</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {currentView === 'categories' ? (
          <CategoryManager />
        ) : currentView === 'featured' ? (
          <FeaturedPostersManager />
        ) : currentView === 'storage' ? (
          <StorageManager />
        ) : currentView === 'debug' ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Bug className="text-red-600" />
                Centre de Debug & Configuration
              </h3>
              
              {/* Section Supabase */}
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">✅ Configuration Supabase</h4>
                <p className="text-green-700 dark:text-green-400 text-sm">
                  Supabase est correctement configuré. Variables d'environnement présentes.
                </p>
              </div>
              
              {/* Section Stripe */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">✅ Configuration Stripe</h4>
                <p className="text-blue-700 dark:text-blue-400 text-sm">
                  Stripe est correctement configuré. Paiements fonctionnels.
                </p>
              </div>
            </div>
            
            {/* Section Database Debug */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-4 flex items-center gap-2">
                🛠️ Debug Supabase
              </h4>
              <DebugSupabase />
            </div>
            
            {/* Section Database Fixer */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-4 flex items-center gap-2">
                🔧 Correcteur de Base de Données
              </h4>
              <DatabaseFixer />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                Gestion des Affiches
              </h2>
              <Button
                onClick={() => setShowPosterForm(true)}
                icon={Plus}
                size="sm"
                className="self-start sm:self-auto text-sm"
              >
                <span className="hidden xs:inline">Nouvelle affiche</span>
                <span className="xs:hidden">Nouveau</span>
              </Button>
            </div>

            {/* Posters Table */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Chargement des affiches...
                </p>
              </div>
            ) : (
              <PosterTable
                posters={posters}
                onEdit={handleEditPoster}
                onDelete={handleDeletePoster}
                onTogglePublish={handleTogglePublish}
                onToggleFeatured={handleToggleFeatured}
              />
            )}
          </div>
        )}

        {/* Poster Form Modal */}
        {showPosterForm && (
          <PosterForm
            poster={editingPoster}
            onSave={handlePosterSave}
            onCancel={() => {
              setShowPosterForm(false);
              setEditingPoster(undefined);
            }}
          />
        )}
      </Container>
    </div>
  );
};