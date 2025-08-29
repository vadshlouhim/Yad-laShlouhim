import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { RefreshCw, CheckCircle } from 'lucide-react';

export const FixPosters = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<string[]>([]);

  const categoryMapping = {
    // Anciennes catégories vers nouvelles catégories (basé sur le nom)
    'roch-hachana-kippour': '880a3506-3d75-4d52-96de-1c9f1c2584c9',
    'souccot-simhat-beit-hachoeva': '5d6cd60a-e175-4628-8a40-05d7b6f9edc8',
    '19-kislev-hanoucca': '5b427b2e-fd88-478d-b753-3ebf6c966526',
    'tou-bichvat': 'f7d97308-93fb-4a75-93cf-407fdfdbb01d',
    'pourim': 'e3f97490-adba-47b5-bace-56db1b03ee5a',
    'pessah': '50509e79-28b4-4ad8-89df-60a107d4144d',
    'lag-baomer': '65aac550-4dee-4a61-b7dc-1d68fe90296b',
    'chavouot': '65a65e75-8c74-49bc-8e61-c2dadbdb88ff',
    'gan-israel': '10b9588b-ade4-4744-942a-af83d6580317',
    'talmud-torah': '867e373a-5fa5-4e24-92db-126f73aa4e36',
    'fiancailles-bar-mitsva': 'af9e9e82-0aae-4ee8-9157-0d33152b2802',
    'brochures': '7e4d5901-a64b-41c8-b766-a07da6c180a6',
    'magnets': 'bb0c7233-ff99-4305-af8d-538a65737eaf',
    'les-tefilines-en-6-etapes': '7cacedde-4bb5-46e1-906d-3aa8f0fb7ef1',
    'farbrenguen-cours': '327c4adc-7a6e-459d-ab29-accffb5b3849',
    'autres': '6242bd03-1b1a-4524-88ec-7c39f1d04aa9'
  };

  const fixPosters = async () => {
    setIsFixing(true);
    setStatus('idle');
    setMessage('');
    setDetails([]);

    try {
      console.log('🔧 Début de la correction des affiches...');
      setDetails(prev => [...prev, '🔧 Début de la correction des affiches...']);

      // 1. Récupérer toutes les affiches
      const { data: posters, error: postersError } = await supabase
        .from('posters')
        .select('id, category_id, title');

      if (postersError) {
        throw new Error(`Erreur lors de la récupération des affiches: ${postersError.message}`);
      }

      console.log(`📋 ${posters?.length || 0} affiches trouvées`);
      setDetails(prev => [...prev, `📋 ${posters?.length || 0} affiches trouvées`]);

      // 2. Récupérer toutes les nouvelles catégories
      const { data: newCategories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, slug, name');

      if (categoriesError) {
        throw new Error(`Erreur lors de la récupération des catégories: ${categoriesError.message}`);
      }

      console.log(`🏷️ ${newCategories?.length || 0} nouvelles catégories trouvées`);
      setDetails(prev => [...prev, `🏷️ ${newCategories?.length || 0} nouvelles catégories trouvées`]);

      // 3. Créer un mapping slug -> id pour les nouvelles catégories
      const slugToId: Record<string, string> = {};
      newCategories?.forEach(cat => {
        slugToId[cat.slug] = cat.id;
      });

      // 4. Identifier les affiches avec des category_id invalides
      const validCategoryIds = new Set(newCategories?.map(cat => cat.id) || []);
      const postersToFix = posters?.filter(poster => 
        !validCategoryIds.has(poster.category_id)
      ) || [];

      console.log(`🔍 ${postersToFix.length} affiches à corriger`);
      setDetails(prev => [...prev, `🔍 ${postersToFix.length} affiches à corriger`]);

      if (postersToFix.length === 0) {
        setStatus('success');
        setMessage('✅ Aucune affiche à corriger. Toutes les références sont valides !');
        return;
      }

      // 5. Corriger les affiches une par une
      let fixedCount = 0;
      let errorCount = 0;

      for (const poster of postersToFix) {
        try {
          // Essayer de deviner la nouvelle catégorie basée sur le titre ou assigner par défaut
          let newCategoryId = slugToId['autres']; // Catégorie par défaut

          // Logique simple pour mapper basée sur le titre
          const title = poster.title.toLowerCase();
          
          if (title.includes('roch') || title.includes('kippour')) {
            newCategoryId = slugToId['roch-hachana-kippour'];
          } else if (title.includes('souccot') || title.includes('hachoeva')) {
            newCategoryId = slugToId['souccot-simhat-beit-hachoeva'];
          } else if (title.includes('hanoucca') || title.includes('kislev')) {
            newCategoryId = slugToId['19-kislev-hanoucca'];
          } else if (title.includes('tou') && title.includes('bichvat')) {
            newCategoryId = slugToId['tou-bichvat'];
          } else if (title.includes('pourim') || title.includes('meguila')) {
            newCategoryId = slugToId['pourim'];
          } else if (title.includes('pessah')) {
            newCategoryId = slugToId['pessah'];
          } else if (title.includes('lag') && title.includes('baomer')) {
            newCategoryId = slugToId['lag-baomer'];
          } else if (title.includes('chavouot')) {
            newCategoryId = slugToId['chavouot'];
          } else if (title.includes('gan') && title.includes('israel')) {
            newCategoryId = slugToId['gan-israel'];
          } else if (title.includes('talmud') && title.includes('torah')) {
            newCategoryId = slugToId['talmud-torah'];
          } else if (title.includes('fiancailles') || title.includes('bar') || title.includes('mitsva')) {
            newCategoryId = slugToId['fiancailles-bar-mitsva'];
          } else if (title.includes('brochure')) {
            newCategoryId = slugToId['brochures'];
          } else if (title.includes('magnet')) {
            newCategoryId = slugToId['magnets'];
          } else if (title.includes('tefiline')) {
            newCategoryId = slugToId['les-tefilines-en-6-etapes'];
          } else if (title.includes('farbreng') || title.includes('cours')) {
            newCategoryId = slugToId['farbrenguen-cours'];
          }

          // Mettre à jour l'affiche
          const { error: updateError } = await supabase
            .from('posters')
            .update({ category_id: newCategoryId })
            .eq('id', poster.id);

          if (updateError) {
            console.error(`❌ Erreur mise à jour ${poster.title}:`, updateError);
            setDetails(prev => [...prev, `❌ Erreur ${poster.title}: ${updateError.message}`]);
            errorCount++;
          } else {
            console.log(`✅ Corrigé: ${poster.title}`);
            setDetails(prev => [...prev, `✅ Corrigé: ${poster.title}`]);
            fixedCount++;
          }
        } catch (error) {
          console.error(`❌ Erreur pour ${poster.title}:`, error);
          setDetails(prev => [...prev, `❌ Erreur ${poster.title}: ${error}`]);
          errorCount++;
        }
      }

      // 6. Résumé
      const summary = `✅ Correction terminée: ${fixedCount} affiches corrigées, ${errorCount} erreurs`;
      console.log(summary);
      setDetails(prev => [...prev, summary]);

      if (errorCount === 0) {
        setStatus('success');
        setMessage(`Toutes les affiches ont été corrigées avec succès ! ${fixedCount} affiches mises à jour.`);
      } else {
        setStatus('error');
        setMessage(`Correction partielle: ${fixedCount} affiches corrigées, ${errorCount} erreurs.`);
      }

    } catch (error) {
      console.error('❌ Erreur générale:', error);
      setStatus('error');
      setMessage(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setDetails(prev => [...prev, `❌ Erreur générale: ${error}`]);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        🔧 Corriger les références de catégories
      </h3>
      
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          Cet outil corrige automatiquement les références de catégories des affiches pour qu'elles correspondent aux nouvelles catégories créées.
        </p>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>⚠️ Attention:</strong> Cette opération modifie les données en base. Assurez-vous d'avoir une sauvegarde si nécessaire.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fixPosters}
            loading={isFixing}
            icon={RefreshCw}
            disabled={status === 'success'}
          >
            {isFixing ? 'Correction en cours...' : 'Corriger les affiches'}
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

        {details.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-60 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Détails:</h4>
            <div className="space-y-1">
              {details.map((detail, idx) => (
                <p key={idx} className="text-xs font-mono text-gray-600 dark:text-gray-400">
                  {detail}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};