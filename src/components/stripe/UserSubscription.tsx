import { useState, useEffect } from 'react';
import { Crown, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import { stripeProducts } from '../../stripe-config';

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export const UserSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error loading subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (priceId: string | null) => {
    if (!priceId) return 'Plan gratuit';
    const product = stripeProducts.find(p => p.priceId === priceId);
    return product?.name || 'Plan inconnu';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'trialing':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      case 'past_due':
      case 'unpaid':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'canceled':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'trialing':
        return 'Période d\'essai';
      case 'past_due':
        return 'Paiement en retard';
      case 'unpaid':
        return 'Impayé';
      case 'canceled':
        return 'Annulé';
      case 'not_started':
        return 'Non démarré';
      default:
        return status;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <Crown className="w-6 h-6 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Mon abonnement
        </h3>
      </div>

      {subscription ? (
        <div className="space-y-4">
          {/* Plan Name */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">
              {getProductName(subscription.price_id)}
            </h4>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.subscription_status)}`}>
              {getStatusLabel(subscription.subscription_status)}
            </span>
            {subscription.cancel_at_period_end && (
              <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                Annulation programmée
              </span>
            )}
          </div>

          {/* Period Info */}
          {subscription.current_period_start && subscription.current_period_end && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Du {formatDate(subscription.current_period_start)} au {formatDate(subscription.current_period_end)}
              </span>
            </div>
          )}

          {/* Payment Method */}
          {subscription.payment_method_brand && subscription.payment_method_last4 && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm">
                {subscription.payment_method_brand.toUpperCase()} •••• {subscription.payment_method_last4}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-600 dark:text-gray-400">
            Aucun abonnement actif
          </p>
        </div>
      )}
    </div>
  );
};