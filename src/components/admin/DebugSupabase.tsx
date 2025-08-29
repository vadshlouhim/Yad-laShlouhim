import { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { StripeStatus } from '../stripe/StripeStatus';
import { InitializeCategories } from './InitializeCategories';
import { FixPosters } from './FixPosters';
import { FixForeignKey } from './FixForeignKey';

export const DebugSupabase = () => {
  const [result, setResult] = useState<string>('');
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setResult('');
    
    try {
      // Test 1: Connexion basique
      setResult(prev => prev + '🔍 Test de connexion à Supabase...\n');
      
      const { data: testData, error: testError } = await supabase
        .from('posters')
        .select('id, title, is_featured')
        .limit(1);
      
      if (testError) {
        setResult(prev => prev + `❌ Erreur de connexion: ${testError.message}\n`);
        return;
      }
      
      setResult(prev => prev + '✅ Connexion OK\n');
      
      // Test 2: Vérifier la structure des données
      if (testData && testData.length > 0) {
        const poster = testData[0];
        setResult(prev => prev + `📋 Structure poster: ${JSON.stringify(poster)}\n`);
        
        if ('is_featured' in poster) {
          setResult(prev => prev + '✅ Colonne is_featured existe\n');
        } else {
          setResult(prev => prev + '❌ Colonne is_featured manquante\n');
        }
      }
      
      // Test 3: Tentative de mise à jour
      if (testData && testData.length > 0) {
        setResult(prev => prev + '🔄 Test de mise à jour...\n');
        
        const { error: updateError } = await supabase
          .from('posters')
          .update({ is_featured: false })
          .eq('id', testData[0].id);
        
        if (updateError) {
          setResult(prev => prev + `❌ Erreur de mise à jour: ${updateError.message}\n`);
        } else {
          setResult(prev => prev + '✅ Mise à jour OK\n');
        }
      }
      
    } catch (error) {
      setResult(prev => prev + `💥 Erreur inattendue: ${error}\n`);
    } finally {
      setTesting(false);
    }
  };

  const addColumn = async () => {
    setTesting(true);
    setResult('');
    
    try {
      setResult(prev => prev + '🔧 Tentative d\'ajout de la colonne is_featured...\n');
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          DO $$ 
          BEGIN 
              IF NOT EXISTS (
                  SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'posters' AND column_name = 'is_featured'
              ) THEN
                  ALTER TABLE posters ADD COLUMN is_featured boolean DEFAULT false;
              END IF;
          END $$;
        `
      });
      
      if (error) {
        setResult(prev => prev + `❌ Erreur SQL: ${error.message}\n`);
      } else {
        setResult(prev => prev + '✅ Colonne ajoutée avec succès\n');
      }
      
    } catch (error) {
      setResult(prev => prev + `💥 Erreur: ${error}\n`);
    } finally {
      setTesting(false);
    }
  };

  const testStripeFunction = async () => {
    setTesting(true);
    setResult('');
    
    try {
      setResult(prev => prev + '🔍 Test de la fonction Stripe...\n');
      
      // Test avec des données factices
      const testData = {
        posterId: 'test-poster-id',
        customerData: {
          customer_name: 'Test User',
          customer_email: 'test@example.com',
          phone: null,
          organization: null,
          notes: null
        }
      };
      
      setResult(prev => prev + '📡 Appel de la fonction create-poster-checkout...\n');
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-poster-checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(testData)
      });
      
      setResult(prev => prev + `📊 Status: ${response.status}\n`);
      
      const responseText = await response.text();
      setResult(prev => prev + `📋 Réponse: ${responseText}\n`);
      
      if (response.status === 404) {
        setResult(prev => prev + '❌ Poster test non trouvé (normal pour un test)\n');
      } else if (response.status === 400) {
        setResult(prev => prev + '⚠️ Erreur de validation (normal pour un test)\n');
      } else if (response.ok) {
        setResult(prev => prev + '✅ Fonction Stripe fonctionne !\n');
      } else {
        setResult(prev => prev + `❌ Erreur inattendue: ${response.status}\n`);
      }
      
      // Vérifier les variables d'environnement
      setResult(prev => prev + '\n🔧 Vérification des variables d\'environnement...\n');
      setResult(prev => prev + `VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌'}\n`);
      setResult(prev => prev + `VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌'}\n`);
      
    } catch (error) {
      setResult(prev => prev + `💥 Erreur: ${error}\n`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stripe Status */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">$</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Statut Stripe
          </h2>
        </div>
        <StripeStatus />
      </div>
      
      <FixForeignKey />
      <InitializeCategories />
      <FixPosters />
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Debug Supabase
          </h2>
        </div>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <Button
            onClick={testConnection}
            disabled={testing}
            variant="outline"
          >
            {testing ? 'Test en cours...' : 'Tester la connexion'}
          </Button>
          
          <Button
            onClick={testStripeFunction}
            disabled={testing}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {testing ? 'Test en cours...' : 'Tester Stripe'}
          </Button>
          
          <Button
            onClick={addColumn}
            disabled={testing}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {testing ? 'Ajout en cours...' : 'Ajouter colonne is_featured'}
          </Button>
        </div>
        
        {result && (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800 dark:text-gray-200">
              {result}
            </pre>
          </div>
        )}
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Instructions manuelles (si l'auto n'fonctionne pas) :
          </h3>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>1. Allez dans Supabase Dashboard → SQL Editor</li>
            <li>2. Collez ce code :</li>
            <li className="font-mono bg-blue-100 dark:bg-blue-800 p-2 rounded">
              ALTER TABLE posters ADD COLUMN is_featured boolean DEFAULT false;
            </li>
            <li>3. Cliquez "Run"</li>
            <li>4. Actualisez cette page</li>
          </ol>
        </div>
      </div>
    </div>
    </div>
  );
};
