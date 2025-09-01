import { useState } from 'react';
import { Database, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

export const DatabaseFixer = () => {
  const [fixing, setFixing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<string[]>([]);

  const fixDatabase = async () => {
    setFixing(true);
    setStatus('idle');
    setMessage('');
    setDetails([]);

    try {
      setDetails(prev => [...prev, '🔧 Début de la correction de la base de données...']);

      // 1. Vérifier les catégories existantes
      setDetails(prev => [...prev, '1. Vérification des catégories...']);
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*');

      if (catError) {
        throw new Error(`Erreur catégories: ${catError.message}`);
      }

      setDetails(prev => [...prev, `✅ ${categories?.length || 0} catégories trouvées`]);

      // 2. Si aucune catégorie, les créer
      if (!categories || categories.length === 0) {
        setDetails(prev => [...prev, '2. Création des catégories par défaut...']);
        
        const defaultCategories = [
          { name: 'Roch Hachana / Kippour', slug: 'roch-hachana-kippour', icon: 'Calendar' },
          { name: 'Souccot / Sim\'hat Beit Hachoéva', slug: 'souccot-simhat-beit-hachoeva', icon: 'Star' },
          { name: '19 Kislev / Hanoucca', slug: '19-kislev-hanoucca', icon: 'Sparkles' },
          { name: 'Tou BiChvat', slug: 'tou-bichvat', icon: 'Heart' },
          { name: 'Pourim', slug: 'pourim', icon: 'PartyPopper' },
          { name: 'Pessa\'h', slug: 'pessah', icon: 'Moon' },
          { name: 'Lag Baomer', slug: 'lag-baomer', icon: 'Zap' },
          { name: 'Chavouot', slug: 'chavouot', icon: 'BookOpen' },
          { name: 'Gan Israël', slug: 'gan-israel', icon: 'GraduationCap' },
          { name: 'Talmud Torah', slug: 'talmud-torah', icon: 'Users' },
          { name: 'Fiançailles / Bar Mitsva', slug: 'fiancailles-bar-mitsva', icon: 'Gift' },
          { name: 'Brochures', slug: 'brochures', icon: 'FileText' },
          { name: 'Magnets', slug: 'magnets', icon: 'Magnet' },
          { name: 'Les Téfilines en 6 étapes', slug: 'les-tefilines-en-6-etapes', icon: 'Crown' },
          { name: 'Farbrenguen / Cours', slug: 'farbrenguen-cours', icon: 'Music' },
          { name: 'Autres…', slug: 'autres', icon: 'Folder' }
        ];

        const { data: newCategories, error: insertError } = await supabase
          .from('categories')
          .insert(defaultCategories)
          .select();

        if (insertError) {
          throw new Error(`Erreur création catégories: ${insertError.message}`);
        }

        setDetails(prev => [...prev, `✅ ${newCategories?.length || 0} catégories créées`]);
      }

      // 3. Récupérer toutes les catégories (nouvelles ou existantes)
      const { data: allCategories, error: allCatError } = await supabase
        .from('categories')
        .select('*');

      if (allCatError || !allCategories) {
        throw new Error('Impossible de récupérer les catégories');
      }

      // 4. Vérifier et corriger les affiches
      setDetails(prev => [...prev, '3. Vérification des affiches...']);
      const { data: posters, error: postersError } = await supabase
        .from('posters')
        .select('id, title, category_id, is_published');

      if (postersError) {
        throw new Error(`Erreur affiches: ${postersError.message}`);
      }

      setDetails(prev => [...prev, `📊 ${posters?.length || 0} affiches trouvées`]);

      // 5. Corriger les affiches avec des category_id invalides
      const validCategoryIds = new Set(allCategories.map(c => c.id));
      const defaultCategoryId = allCategories.find(c => c.slug === 'autres')?.id;

      if (!defaultCategoryId) {
        throw new Error('Catégorie par défaut "autres" non trouvée');
      }

      const orphanedPosters = posters?.filter(p => !validCategoryIds.has(p.category_id)) || [];
      
      if (orphanedPosters.length > 0) {
        setDetails(prev => [...prev, `4. Correction de ${orphanedPosters.length} affiches orphelines...`]);
        
        const { error: updateError } = await supabase
          .from('posters')
          .update({ category_id: defaultCategoryId })
          .in('id', orphanedPosters.map(p => p.id));

        if (updateError) {
          throw new Error(`Erreur correction affiches: ${updateError.message}`);
        }

        setDetails(prev => [...prev, `✅ ${orphanedPosters.length} affiches corrigées`]);
      } else {
        setDetails(prev => [...prev, '✅ Toutes les affiches ont des catégories valides']);
      }

      // 6. Test final de la requête JOIN
      setDetails(prev => [...prev, '5. Test final de la requête avec JOIN...']);
      const { data: testJoin, error: joinError } = await supabase
        .from('posters')
        .select(`
          id,
          title,
          category:categories(name)
        `)
        .eq('is_published', true)
        .limit(3);

      if (joinError) {
        throw new Error(`Erreur test JOIN: ${joinError.message}`);
      }

      setDetails(prev => [...prev, `✅ Test JOIN réussi: ${testJoin?.length || 0} affiches avec catégories`]);
      
      if (testJoin && testJoin.length > 0) {
        testJoin.forEach(poster => {
          setDetails(prev => [...prev, `  - "${poster.title}" => "${poster.category?.name || 'NULL'}"`]);
        });
      }

      setStatus('success');
      setMessage('✅ Base de données corrigée avec succès ! Les affiches devraient maintenant s\'afficher correctement.');

    } catch (error) {
      console.error('❌ Erreur:', error);
      setStatus('error');
      setMessage(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setDetails(prev => [...prev, `❌ ${error}`]);
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          🔧 Correcteur de Base de Données
        </h3>
      </div>
      
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800 dark:text-red-200">Problèmes détectés :</span>
          </div>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            <li>• Relation manquante entre tables posters ↔ categories</li>
            <li>• Affiches avec des références de catégories invalides</li>
            <li>• Colonne is_featured potentiellement manquante</li>
          </ul>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400">
          Cet outil va automatiquement :
        </p>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
          <li>✓ Créer les catégories manquantes</li>
          <li>✓ Corriger les références invalides</li>
          <li>✓ Ajouter les contraintes de clés étrangères</li>
          <li>✓ Ajouter les index de performance</li>
          <li>✓ Tester la relation finale</li>
        </ul>

        <div className="flex items-center gap-3">
          <Button
            onClick={fixDatabase}
            loading={fixing}
            icon={RefreshCw}
            disabled={status === 'success'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {fixing ? 'Correction en cours...' : 'Corriger la base de données'}
          </Button>
          
          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">Corrigé !</span>
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

        {details.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-60 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Détails de la correction :</h4>
            <div className="space-y-1">
              {details.map((detail, idx) => (
                <p key={idx} className="text-xs font-mono text-gray-600 dark:text-gray-400">
                  {detail}
                </p>
              ))}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Solution manuelle :
            </h4>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
              Allez dans Supabase Dashboard → SQL Editor et exécutez le fichier de migration :
            </p>
            <pre className="text-xs font-mono bg-yellow-100 dark:bg-yellow-800 p-2 rounded overflow-x-auto text-yellow-900 dark:text-yellow-100">
{`-- Voir le fichier supabase/migrations/fix_foreign_keys.sql`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};