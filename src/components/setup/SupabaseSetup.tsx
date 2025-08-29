import { useState } from 'react';
import { Database, ExternalLink, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export const SupabaseSetup = () => {
  const [step, setStep] = useState(1);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const currentUrl = import.meta.env.VITE_SUPABASE_URL;
  const currentKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const steps = [
    {
      title: "Créer un projet Supabase",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Si vous n'avez pas encore de projet Supabase :
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Allez sur <a href="https://supabase.com" target="_blank" className="text-blue-600 hover:underline">supabase.com</a></li>
            <li>Cliquez sur "Start your project"</li>
            <li>Connectez-vous avec GitHub</li>
            <li>Cliquez sur "New project"</li>
            <li>Choisissez un nom et un mot de passe pour votre base</li>
            <li>Attendez que le projet soit créé (2-3 minutes)</li>
          </ol>
        </div>
      )
    },
    {
      title: "Récupérer l'URL et la clé API",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Dans votre dashboard Supabase :
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Cliquez sur <strong>Settings</strong> (⚙️) dans la barre latérale</li>
            <li>Cliquez sur <strong>API</strong></li>
            <li>Copiez l'<strong>URL</strong> dans "Project URL"</li>
            <li>Copiez la <strong>clé "anon public"</strong> dans "Project API keys"</li>
          </ol>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900 dark:text-blue-100">Exemple :</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <strong>URL :</strong> <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">https://abcdefghijk.supabase.co</code>
              </div>
              <div>
                <strong>Clé :</strong> <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">eyJhbGciOiJIUzI1NiIsInR5cCI6...</code>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Configurer les variables d'environnement",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Créez ou modifiez votre fichier <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">.env</code> :
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contenu du fichier .env :</span>
              <Button
                onClick={() => copyToClipboard(`VITE_SUPABASE_URL=${supabaseUrl || 'https://votre-projet-id.supabase.co'}
VITE_SUPABASE_ANON_KEY=${supabaseKey || 'votre-cle-anon-publique'}`, 'env')}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                {copied === 'env' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
            <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
{`VITE_SUPABASE_URL=${supabaseUrl || 'https://votre-projet-id.supabase.co'}
VITE_SUPABASE_ANON_KEY=${supabaseKey || 'votre-cle-anon-publique'}`}
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL Supabase
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://votre-projet-id.supabase.co"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Clé Anon Public
              </label>
              <input
                type="text"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configuration Supabase
        </h2>
      </div>

      {/* Status actuel */}
      <div className="mb-8 p-4 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          {currentUrl && currentKey ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-700 dark:text-green-300">Supabase configuré</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-700 dark:text-red-300">Supabase non configuré</span>
            </>
          )}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>URL: {currentUrl ? '✅ Configurée' : '❌ Manquante'}</p>
          <p>Clé: {currentKey ? '✅ Configurée' : '❌ Manquante'}</p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((stepData, index) => (
          <div key={index} className={`border rounded-lg p-6 ${step === index + 1 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                step > index + 1 ? 'bg-green-500' : step === index + 1 ? 'bg-blue-500' : 'bg-gray-400'
              }`}>
                {step > index + 1 ? '✓' : index + 1}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {stepData.title}
              </h3>
            </div>
            
            {step >= index + 1 && (
              <div className="ml-11">
                {stepData.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          onClick={() => setStep(Math.max(1, step - 1))}
          variant="outline"
          disabled={step === 1}
        >
          Précédent
        </Button>
        
        <div className="flex gap-2">
          <a href="https://supabase.com/dashboard" target="_blank">
            <Button variant="outline" icon={ExternalLink}>
              Ouvrir Supabase
            </Button>
          </a>
          
          <Button
            onClick={() => setStep(Math.min(3, step + 1))}
            disabled={step === 3}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
};