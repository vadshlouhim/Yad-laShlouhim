import { useState } from 'react';
import { AlertTriangle, Play, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export const PaymentDebug = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string>('');

  const runPaymentTest = async () => {
    setTesting(true);
    setResults('');
    
    try {
      setResults(prev => prev + '=== TEST COMPLET DU FLUX DE PAIEMENT ===\n\n');
      
      // 1. Vérifier les variables d'environnement
      setResults(prev => prev + '1. Vérification des variables d\'environnement...\n');
      const envVars = {
        'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
        'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY
      };
      
      Object.entries(envVars).forEach(([key, value]) => {
        setResults(prev => prev + `   ${key}: ${value ? '✅ Configuré' : '❌ Manquant'}\n`);
      });
      
      if (!envVars.VITE_SUPABASE_URL || !envVars.VITE_SUPABASE_ANON_KEY) {
        setResults(prev => prev + '\n❌ Variables d\'environnement manquantes !\n');
        return;
      }
      
      // 2. Tester la fonction Supabase Edge Function
      setResults(prev => prev + '\n2. Test de la fonction create-poster-checkout...\n');
      
      const testPayload = {
        posterId: 'test-id',
        customerData: {
          customer_name: 'Test User',
          customer_email: 'test@example.com'
        }
      };
      
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-poster-checkout`;
      setResults(prev => prev + `   URL: ${functionUrl}\n`);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(testPayload)
      });
      
      setResults(prev => prev + `   Status: ${response.status}\n`);
      
      const responseText = await response.text();
      setResults(prev => prev + `   Réponse: ${responseText.substring(0, 200)}...\n`);
      
      if (response.status === 404) {
        setResults(prev => prev + '   ✅ Fonction accessible (erreur 404 normale pour test)\n');
      } else if (response.status === 400) {
        setResults(prev => prev + '   ✅ Fonction accessible (erreur 400 normale pour test)\n');
      } else if (response.ok) {
        setResults(prev => prev + '   ✅ Fonction fonctionne parfaitement !\n');
      } else {
        setResults(prev => prev + `   ❌ Erreur inattendue: ${response.status}\n`);
      }
      
      // 3. Vérifier la connectivité réseau
      setResults(prev => prev + '\n3. Test de connectivité réseau...\n');
      
      try {
        const networkTest = await fetch('https://httpbin.org/get');
        if (networkTest.ok) {
          setResults(prev => prev + '   ✅ Connectivité réseau OK\n');
        } else {
          setResults(prev => prev + '   ⚠️ Problème de connectivité réseau\n');
        }
      } catch (networkError) {
        setResults(prev => prev + '   ❌ Pas de connectivité réseau\n');
      }
      
      // 4. Recommandations
      setResults(prev => prev + '\n4. Recommandations pour résoudre le problème:\n');
      setResults(prev => prev + '   • Vérifiez la console du navigateur pour les erreurs\n');
      setResults(prev => prev + '   • Assurez-vous que Supabase est bien connecté\n');
      setResults(prev => prev + '   • Vérifiez que les Edge Functions sont déployées\n');
      setResults(prev => prev + '   • Testez avec un poster existant dans la base\n');
      
    } catch (error) {
      setResults(prev => prev + `\n💥 ERREUR CRITIQUE: ${error}\n`);
      setResults(prev => prev + '\nCela indique un problème de configuration ou de réseau.\n');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed top-4 left-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-2xl border z-50 max-w-lg">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-orange-500" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          🐛 Debug Paiement
        </h3>
      </div>
      
      <Button
        onClick={runPaymentTest}
        loading={testing}
        size="sm"
        icon={Play}
        className="mb-4 w-full"
      >
        Diagnostiquer le problème
      </Button>

      {results && (
        <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 max-h-80 overflow-y-auto">
          <pre className="text-xs font-mono whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {results}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Ouvrez la console du navigateur (F12) pour plus de détails
      </div>
    </div>
  );
};