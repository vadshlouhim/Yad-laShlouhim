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
import { SupabaseSetup } from '../components/setup/SupabaseSetup';
import { supabase } from '../lib/supabase';
import { Poster } from '../types';

type AdminView = 'posters' | 'categories' | 'featured' | 'storage' | 'debug' | 'setup' | 'fix';

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
      const { data, error } = await supabase
        .from('posters')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosters(data || []);
    } catch (error) {
      console.error('Error loading posters:', error);
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
      const { error } = await supabase
        .from('posters')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      loadPosters();
    } catch (error) {
      console.error('Error deleting poster:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleTogglePublish = async (poster: Poster) => {
    try {
      const { error } = await supabase
        .from('posters')
        .update({ is_published: !poster.is_published })
        .eq('id', poster.id);
      
      if (error) throw error;
      loadPosters();
    } catch (error) {
      console.error('Error updating poster:', error);
      alert('Erreur lors de la mise à jour');
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
              <span className="xs:hidden">Bug</span>
            </button>
            <button
              onClick={() => setCurrentView('setup')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                currentView === 'setup'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Database size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden xs:inline">Setup</span>
              <span className="xs:hidden">Setup</span>
            </button>
            <button
              onClick={() => setCurrentView('fix')}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                currentView === 'fix'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Database size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden xs:inline">Corriger DB</span>
              <span className="xs:hidden">Fix</span>
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
          <DebugSupabase />
        ) : currentView === 'setup' ? (
          <SupabaseSetup />
        ) : currentView === 'fix' ? (
          <DatabaseFixer />
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