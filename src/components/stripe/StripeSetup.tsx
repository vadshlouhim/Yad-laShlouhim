import { useState } from 'react';
import { CreditCard, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { validateStripeConfig } from '../../lib/stripe';
import { isSupabaseConfigured } from '../../lib/supabase';

export const StripeSetup = () => {
  const [step, setStep] = useState(1);
  const [stripeKey, setStripeKey] = useState('');
  const [copied, setCopied] = useState(false);

  const isStripeConfigured = validateStripeConfig();
  const isSupabaseReady = isSupabaseConfigured();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const steps = [
    {
      title: "Créer un compte Stripe",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Si vous n'avez pas encore de compte Stripe :
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Allez sur <a href="https://stripe.com" target="_blank" className="text-blue-600 hover:underline">stripe.com</a></li>
            <li>Cliquez sur "Start now" ou "Créer un compte"</li>
            <li>Remplissez les informations de votre entreprise</li>
            <li>Vérifiez votre email</li>
            <li>Activez votre compte (peut nécessiter des documents)</li>
          </ol>
        </div>
      )
    },
    {
      title: "Récupérer les clés API Stripe",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Dans votre dashboard Stripe :
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Connectez-vous à votre <a href="https://dashboard.stripe.com" target="_blank" className="text-blue-600 hover:underline">dashboard Stripe</a></li>
            <li>Cliquez sur <strong>"Developers"</strong> dans le menu</li>
            <li>Cliquez sur <strong>"API keys"</strong></li>
            <li>Copiez la <strong>"Publishable key"</strong> (commence par pk_test_)</li>
            <li>Révélez et copiez la <strong>"Secret key"</strong> (commence par sk_test_)</li>
          </ol>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-900 dark:text-yellow-100">Mode Test</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Utilisez les clés de test (pk_test_ et sk_test_) pour le développement. 
              Les clés de production seront nécessaires pour le déploiement.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Configurer les variables d'environnement",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Ajoutez vos clés Stripe au fichier <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">.env</code> :
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Variables Stripe à ajouter :</span>
              <Button
                onClick={() => copyToClipboard(`VITE_STRIPE_PUBLISHABLE_KEY=${stripeKey || 'pk_test_votre_cle_publique'}
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret`)}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                {copied ? <CheckCircle className="w-3 h-3" /> : 'Copier'}
              </Button>
            </div>
            <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto">
{`VITE_STRIPE_PUBLISHABLE_KEY=${stripeKey || 'pk_test_votre_cle_publique'}
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret`}
            </pre>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Clé publique Stripe (pk_test_...)
            </label>
            <input
              type="text"
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              placeholder="pk_test_..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )
    },
    {
      title: "Configurer les webhooks Stripe",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Pour recevoir les notifications de paiement :
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Dans votre dashboard Stripe, allez dans <strong>Developers → Webhooks</strong></li>
            <li>Cliquez sur <strong>"Add endpoint"</strong></li>
            <li>URL de l'endpoint : <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">https://votre-site.netlify.app/.netlify/functions/stripeWebhook</code></li>
            <li>Sélectionnez l'événement : <strong>checkout.session.completed</strong></li>
            <li>Cliquez sur <strong>"Add endpoint"</strong></li>
            <li>Copiez le <strong>"Signing secret"</strong> (commence par whsec_)</li>
          </ol>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>💡 Important :</strong> Le webhook est nécessaire pour confirmer les paiements et envoyer les liens Canva automatiquement.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configuration Stripe
        </h2>
      </div>

      {/* Status actuel */}
      <div className="mb-8 p-4 rounded-lg border">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isSupabaseReady ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-medium ${
              isSupabaseReady 
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              Supabase: {isSupabaseReady ? 'Configuré ✅' : 'Non configuré ❌'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {isStripeConfigured ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-medium ${
              isStripeConfigured 
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              Stripe: {isStripeConfigured ? 'Configuré ✅' : 'Non configuré ❌'}
            </span>
          </div>
        </div>
      </div>

      {!isSupabaseReady && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 font-medium">
            ⚠️ Supabase doit être configuré avant Stripe
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            Allez dans l'onglet "Setup" pour configurer Supabase d'abord.
          </p>
        </div>
      )}

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
          <a href="https://dashboard.stripe.com" target="_blank">
            <Button variant="outline" icon={ExternalLink}>
              Ouvrir Stripe Dashboard
            </Button>
          </a>
          
          <Button
            onClick={() => setStep(Math.min(4, step + 1))}
            disabled={step === 4}
          >
            Suivant
          </Button>
        </div>
      </div>

      {/* Test de configuration */}
      {isStripeConfigured && isSupabaseReady && (
        <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800 dark:text-green-200">Configuration complète !</span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            Stripe et Supabase sont configurés. Vous pouvez maintenant tester les paiements sur votre site.
          </p>
        </div>
      )}
    </div>
  );
};