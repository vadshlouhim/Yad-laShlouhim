import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

export const DebugHomePage = () => {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    setDebugInfo('');
    
    let info = '=== DIAGNOSTIC PAGE PRINCIPALE ===\n\n';
    
    try {
      // Test 1: Connexion basique
      info += '1. Test de connexion Supabase...\n';
      const { data: testConnection } = await supabase.from('categories').select('count');
      info += `✅ Connexion OK\n\n`;

      // Test 2: Vérifier les catégories
      info += '2. Vérification des catégories...\n';
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*');
      
      if (catError) {
        info += `❌ Erreur catégories: ${catError.message}\n\n`;
      } else {
        info += `✅ ${categories?.length || 0} catégories trouvées:\n`;
        categories?.forEach(cat => {
          info += `  - ${cat.name} (${cat.id})\n`;
        });
        info += '\n';
      }

      // Test 3: Vérifier toutes les affiches (sans filtre published)
      info += '3. Vérification de TOUTES les affiches...\n';
      const { data: allPosters, error: allPostersError } = await supabase
        .from('posters')
        .select('id, title, is_published, category_id');
      
      if (allPostersError) {
        info += `❌ Erreur toutes affiches: ${allPostersError.message}\n\n`;
      } else {
        info += `📊 ${allPosters?.length || 0} affiches TOTALES trouvées:\n`;
        const published = allPosters?.filter(p => p.is_published).length || 0;
        const unpublished = allPosters?.filter(p => !p.is_published).length || 0;
        info += `  - ${published} publiées\n`;
        info += `  - ${unpublished} non publiées\n\n`;
      }

      // Test 4: Vérifier les affiches publiées seulement
      info += '4. Vérification des affiches PUBLIÉES...\n';
      const { data: publishedPosters, error: pubError } = await supabase
        .from('posters')
        .select('id, title, is_published, category_id')
        .eq('is_published', true);
      
      if (pubError) {
        info += `❌ Erreur affiches publiées: ${pubError.message}\n\n`;
      } else {
        info += `✅ ${publishedPosters?.length || 0} affiches publiées trouvées:\n`;
        publishedPosters?.slice(0, 5).forEach(poster => {
          info += `  - "${poster.title}" (cat: ${poster.category_id})\n`;
        });
        if ((publishedPosters?.length || 0) > 5) {
          info += `  ... et ${(publishedPosters?.length || 0) - 5} autres\n`;
        }
        info += '\n';
      }

      // Test 5: Test de la requête exacte de HomePage
      info += '5. Test de la requête HomePage (avec JOIN)...\n';
      const { data: homePagePosters, error: homeError } = await supabase
        .from('posters')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (homeError) {
        info += `❌ Erreur requête HomePage: ${homeError.message}\n`;
        info += `   Détails: ${JSON.stringify(homeError, null, 2)}\n\n`;
      } else {
        info += `✅ ${homePagePosters?.length || 0} affiches avec JOIN trouvées\n`;
        homePagePosters?.slice(0, 3).forEach(poster => {
          info += `  - "${poster.title}" => catégorie: ${poster.category?.name || 'NULL'}\n`;
        });
        info += '\n';
      }

      // Test 6: Vérifier les catégories orphelines
      info += '6. Vérification des catégories orphelines...\n';
      const validCategoryIds = new Set(categories?.map(c => c.id) || []);
      const orphanPosters = publishedPosters?.filter(p => !validCategoryIds.has(p.category_id)) || [];
      
      if (orphanPosters.length > 0) {
        info += `⚠️ ${orphanPosters.length} affiches avec catégories invalides:\n`;
        orphanPosters.slice(0, 5).forEach(poster => {
          info += `  - "${poster.title}" => catégorie invalide: ${poster.category_id}\n`;
        });
        info += '\n';
      } else {
        info += `✅ Toutes les affiches ont des catégories valides\n\n`;
      }

    } catch (error) {
      info += `💥 ERREUR CRITIQUE: ${error}\n`;
    }
    
    setDebugInfo(info);
    setLoading(false);
  };

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-2xl border z-50 max-w-md">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
        🐛 Debug HomePage
      </h3>
      
      <Button
        onClick={runDiagnostic}
        loading={loading}
        size="sm"
        className="mb-3 w-full"
      >
        Diagnostiquer
      </Button>

      {debugInfo && (
        <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 max-h-96 overflow-y-auto">
          <pre className="text-xs font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {debugInfo}
          </pre>
        </div>
      )}
    </div>
  );
};