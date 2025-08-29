import { useState } from 'react';
import { ShoppingBag, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { StripeProduct } from '../../stripe-config';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';

interface StripeProductCardProps {
  product: StripeProduct;
}

export const StripeProductCard = ({ product }: StripeProductCardProps) => {
  const [loading, setLoading] = useState(false);
  const { user, session } = useAuth();

  const handlePurchase = async () => {
    if (!user || !session) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/`,
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
      console.error('Error creating checkout session:', error);
      alert('Une erreur est survenue lors de la création de la session de paiement.');
    } finally {
      setLoading(false);
    }
  };

  // Format price from Stripe (assuming price is in cents)
  const formatPrice = (priceId: string) => {
    // In a real app, you would fetch the actual price from Stripe
    // For now, we'll use a hardcoded price based on the product
    if (priceId === 'price_1S0pzc2dyqy0l4BDwDGYPzh7') {
      return '38,00 €';
    }
    return 'Prix sur demande';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
      {/* Product Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {product.name}
          </h3>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(product.priceId)}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            product.mode === 'subscription' 
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          }`}>
            {product.mode === 'subscription' ? 'Abonnement' : 'Achat unique'}
          </span>
        </div>
      </div>

      {/* Product Description */}
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
          {product.description}
        </p>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Design professionnel prêt à utiliser
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Personnalisation facile sur Canva
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Formats multiples (A4, A3, réseaux sociaux)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Usage illimité
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handlePurchase}
            loading={loading}
            icon={ShoppingBag}
            className="w-full"
            size="lg"
          >
            {product.mode === 'subscription' ? 'S\'abonner' : 'Acheter maintenant'}
          </Button>
          
          <Button
            onClick={() => window.open('https://canva.com', '_blank')}
            variant="outline"
            icon={ExternalLink}
            className="w-full"
          >
            Voir un aperçu
          </Button>
        </div>
      </div>
    </div>
  );
};