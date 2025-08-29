import { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export const PaymentMethodManager = () => {
  const { user, session } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingMethod, setAddingMethod] = useState(false);

  useEffect(() => {
    if (user) {
      loadPaymentMethods();
    }
  }, [user]);

  const loadPaymentMethods = async () => {
    try {
      // In a real implementation, you would fetch payment methods from Stripe
      // For now, we'll simulate this with subscription data
      const { data: subscription } = await supabase
        .from('stripe_user_subscriptions')
        .select('payment_method_brand, payment_method_last4')
        .maybeSingle();

      if (subscription?.payment_method_brand && subscription?.payment_method_last4) {
        setPaymentMethods([
          {
            id: 'pm_default',
            brand: subscription.payment_method_brand,
            last4: subscription.payment_method_last4,
            exp_month: 12,
            exp_year: 2025,
            is_default: true
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async () => {
    if (!user || !session) return;

    setAddingMethod(true);
    try {
      // Create a setup session for adding payment methods
      const { data, error } = await supabase.functions.invoke('stripe-setup', {
        body: {
          success_url: `${window.location.origin}/account?setup=success`,
          cancel_url: `${window.location.origin}/account?setup=cancel`,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating setup session:', error);
      alert('Une erreur est survenue lors de l\'ajout du moyen de paiement.');
    } finally {
      setAddingMethod(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Moyens de paiement
          </h3>
        </div>
        <Button
          onClick={addPaymentMethod}
          loading={addingMethod}
          icon={Plus}
          size="sm"
          variant="outline"
        >
          Ajouter
        </Button>
      </div>

      {paymentMethods.length > 0 ? (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {method.brand.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    •••• •••• •••• {method.last4}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Expire {method.exp_month.toString().padStart(2, '0')}/{method.exp_year}
                  </p>
                </div>
                {method.is_default && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Par défaut</span>
                  </div>
                )}
              </div>
              
              {!method.is_default && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Aucun moyen de paiement enregistré
          </p>
          <Button
            onClick={addPaymentMethod}
            loading={addingMethod}
            icon={Plus}
          >
            Ajouter une carte
          </Button>
        </div>
      )}
    </div>
  );
};