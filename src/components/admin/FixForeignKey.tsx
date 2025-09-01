import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Link, CheckCircle } from 'lucide-react';

export const FixForeignKey = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<string[]>([]);

  const fixForeignKey = async () => {
    setIsFixing(true);
    setStatus('idle');
    setMessage('');
    setDetails([]);

    try {
      setDetails(prev => [...prev, '🔧 Création de la clé étrangère...']);

      // SQL pour créer la foreign key
      const sqlCommand = `
        -- Ajouter la contrainte de clé étrangère si elle n'existe pas
        DO $$ 
        BEGIN 
            -- Vérifier si la contrainte existe déjà
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_posters_category_id' 
                AND table_name = 'posters'
            ) THEN
                -- Ajouter la contrainte
                ALTER TABLE posters 
                ADD CONSTRAINT fk_posters_category_id 
                FOREIGN KEY (category_id) 
                REFERENCES categories(id) 
                ON DELETE CASCADE;
                
                RAISE NOTICE 'Foreign key constraint added successfully';
            ELSE
                RAISE NOTICE 'Foreign key constraint already exists';
            END IF;
        END $$;
      `;

      setDetails(prev => [...prev, '📝 Exécution du SQL...']);
      
      // Exécuter le SQL via RPC si disponible
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: sqlCommand
        });

        if (error) {
          throw new Error(`Erreur RPC: ${error.message}`);
        }

        setDetails(prev => [...prev, '✅ Clé étrangère créée avec succès !']);
        
      } catch (rpcError) {
        setDetails(prev => [...prev, '⚠️ RPC non disponible, tentative alternative...']);
        
        // Alternative : utiliser une requête SQL directe (peut ne pas fonctionner selon les permissions)
        const { error: directError } = await supabase
          .from('information_schema.table_constraints')
          .select('*')
          .limit(1);

        if (directError) {
          throw new Error(`Impossible d'exécuter le SQL automatiquement. ${directError.message}`);
        }
      }

      // Test de vérification
      setDetails(prev => [...prev, '🧪 Test de la relation...']);
      
      const { data: testData, error: testError } = await supabase
        .from('posters')
        .select(`
          id,
          title,
          category:categories(name)
        `)
        .limit(1);

      if (testError) {
        throw new Error(`Test de relation échoué: ${testError.message}`);
      }

      if (testData && testData.length > 0 && testData[0].category) {
        setDetails(prev => [...prev, '✅ Relation testée avec succès !']);
        setDetails(prev => [...prev, `📋 Test: "${testData[0].title}" => "${testData[0].category.name}"`]);
        
        setStatus('success');
        setMessage('✅ Clé étrangère créée ! La page principale devrait maintenant fonctionner.');
      } else {
        throw new Error('Le test de relation n\'a pas fonctionné comme attendu');
      }

    } catch (error) {
      console.error('❌ Erreur:', error);
      setStatus('error');
      setMessage(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setDetails(prev => [...prev, `❌ ${error}`]);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        🔗 Corriger la relation posters ↔ categories
      </h3>
      
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Problème détecté:</strong> La relation entre les tables `posters` et `categories` manque. 
            C'est pourquoi les affiches ne s'affichent pas sur la page principale.
          </p>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400">
          Cet outil va créer la clé étrangère manquante pour permettre le JOIN entre les tables.
        </p>

        <div className="flex items-center gap-3">
          <Button
            onClick={fixForeignKey}
            loading={isFixing}
            icon={Link}
            disabled={status === 'success'}
          >
            {isFixing ? 'Correction en cours...' : 'Créer la relation'}
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
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-40 overflow-y-auto">
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

        {status === 'error' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Solution manuelle :
            </h4>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
              Allez dans Supabase Dashboard → SQL Editor et exécutez :
            </p>
            <pre className="text-xs font-mono bg-yellow-100 dark:bg-yellow-800 p-2 rounded overflow-x-auto text-yellow-900 dark:text-yellow-100">
{`ALTER TABLE posters 
ADD CONSTRAINT fk_posters_category_id 
FOREIGN KEY (category_id) 
REFERENCES categories(id) 
ON DELETE CASCADE;`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};