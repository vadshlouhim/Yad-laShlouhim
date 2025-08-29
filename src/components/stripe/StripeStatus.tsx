import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface StripeStatusProps {
  className?: string;
}

export const StripeStatus = ({ className = '' }: StripeStatusProps) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error' | 'not-configured'>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkStripeStatus();
  }, []);

  const checkStripeStatus = async () => {
    try {
      // Check if Stripe environment variables are configured
      const hasStripeKey = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      const hasSupabaseUrl = !!import.meta.env.VITE_SUPABASE_URL;
      
      if (!hasStripeKey) {
        setStatus('not-configured');
        setMessage('Clés Stripe non configurées');
        return;
      }

      if (!hasSupabaseUrl) {
        setStatus('error');
        setMessage('Supabase non configuré');
        return;
      }

      // Test a simple API call to verify connectivity
      try {
        const testResponse = await fetch('/.netlify/functions/createCheckout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true })
        });

        if (testResponse.status === 400) {
          // Expected error for test call - means the function is working
          setStatus('connected');
          setMessage('Stripe connecté et fonctionnel');
        } else {
          setStatus('error');
          setMessage('Erreur de connexion Stripe');
        }
      } catch (error) {
        // Try Supabase edge function as fallback
        try {
          const supabaseResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-poster-checkout`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ test: true })
          });

          if (supabaseResponse.status === 400) {
            setStatus('connected');
            setMessage('Stripe connecté via Supabase');
          } else {
            setStatus('error');
            setMessage('Erreur de connexion Stripe');
          }
        } catch (supabaseError) {
          setStatus('error');
          setMessage('Stripe non accessible');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Erreur lors de la vérification');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'not-configured':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'connected':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'not-configured':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'checking':
        return 'text-blue-700 dark:text-blue-300';
      case 'connected':
        return 'text-green-700 dark:text-green-300';
      case 'error':
        return 'text-red-700 dark:text-red-300';
      case 'not-configured':
        return 'text-yellow-700 dark:text-yellow-300';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className={`flex items-center gap-3 p-4 border rounded-lg ${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      <div>
        <p className={`font-medium ${getTextColor()}`}>
          Statut Stripe
        </p>
        <p className={`text-sm ${getTextColor()}`}>
          {message}
        </p>
      </div>
    </div>
  );
};