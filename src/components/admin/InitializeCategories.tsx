import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Database, CheckCircle } from 'lucide-react';

export const InitializeCategories = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const categoriesData = [
    { name: 'Roch Hachana / Kippour', slug: 'roch-hachana-kippour', icon: '🍎' },
    { name: 'Souccot / Sim\'hat Beit Hachoéva', slug: 'souccot-simhat-beit-hachoeva', icon: '🏠' },
    { name: '19 Kislev / Hanoucca', slug: '19-kislev-hanoucca', icon: '🕎' },
    { name: 'Tou BiChvat', slug: 'tou-bichvat', icon: '🌳' },
    { name: 'Pourim', slug: 'pourim', icon: '🎭' },
    { name: 'Pessa\'h', slug: 'pessah', icon: '🍷' },
    { name: 'Lag Baomer', slug: 'lag-baomer', icon: '🔥' },
    { name: 'Chavouot', slug: 'chavouot', icon: '📜' },
    { name: 'Gan Israël', slug: 'gan-israel', icon: '🏫' },
    { name: 'Talmud Torah', slug: 'talmud-torah', icon: '📚' },
    { name: 'Fiançailles / Bar Mitsva', slug: 'fiancailles-bar-mitsva', icon: '💍' },
    { name: 'Brochures', slug: 'brochures', icon: '📋' },
    { name: 'Magnets', slug: 'magnets', icon: '🧲' },
    { name: 'Les Téfilines en 6 étapes', slug: 'les-tefilines-en-6-etapes', icon: '📿' },
    { name: 'Farbrenguen / Cours', slug: 'farbrenguen-cours', icon: '👥' },
    { name: 'Autres…', slug: 'autres', icon: '📂' }
  ];

  const initializeCategories = async () => {
    setIsInitializing(true);
    setStatus('idle');
    setMessage('');

    try {
      console.log('🚀 Initialisation des catégories...');
      
      // Vérifier d'abord si des catégories existent déjà
      const { data: existingCategories, error: checkError } = await supabase
        .from('categories')
        .select('*');

      if (checkError) {
        console.error('Erreur lors de la vérification:', checkError);
        setStatus('error');
        setMessage(`Erreur de vérification: ${checkError.message}`);
        return;
      }

      console.log('Catégories existantes:', existingCategories?.length || 0);
      
      if (existingCategories && existingCategories.length > 0) {
        setStatus('success');
        setMessage(`${existingCategories.length} catégories déjà présentes dans la base.`);
        return;
      }

      // Insérer les catégories
      const { data, error } = await supabase
        .from('categories')
        .insert(categoriesData);

      if (error) {
        console.error('❌ Erreur lors de l\'insertion:', error);
        setStatus('error');
        setMessage(`Erreur d'insertion: ${error.message}`);
      } else {
        console.log('✅ Catégories initialisées avec succès!');
        setStatus('success');
        setMessage(`${categoriesData.length} catégories créées avec succès!`);
      }
    } catch (error) {
      console.error('❌ Erreur générale:', error);
      setStatus('error');
      setMessage(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        🔧 Initialisation des Catégories
      </h3>
      
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          Cliquez sur le bouton ci-dessous pour créer toutes les catégories nécessaires dans Supabase.
        </p>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <strong>Catégories à créer:</strong>
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {categoriesData.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={initializeCategories}
            loading={isInitializing}
            icon={Database}
            disabled={status === 'success'}
          >
            {isInitializing ? 'Initialisation...' : 'Initialiser les catégories'}
          </Button>
          
          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">Terminé</span>
            </div>
          )}
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            status === 'success' 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};