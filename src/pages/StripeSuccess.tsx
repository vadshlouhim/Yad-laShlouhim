import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { stripeProducts } from '../stripe-config';

export const StripeSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // In a real app, you would fetch order details from your backend
      // For now, we'll simulate this
      setTimeout(() => {
        setOrderDetails({
          sessionId,
          product: stripeProducts[0], // For demo purposes
          amount: '38.00',
          currency: 'EUR'
        });
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <Container>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Traitement de votre commande...
            </p>
          </div>
        </Container>
      </div>
    );
  }

  if (!sessionId || !orderDetails) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <Container>
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ArrowLeft className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Commande introuvable
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Nous n'avons pas pu trouver les détails de votre commande.
            </p>
            <Link to="/">
              <Button variant="outline">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <Container>
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Paiement confirmé !
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Merci pour votre achat. Votre commande a été traitée avec succès.
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Détails de votre commande
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Produit</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {orderDetails.product.name}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Montant</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {orderDetails.amount} {orderDetails.currency}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 dark:text-gray-400">ID de session</span>
                <span className="font-mono text-sm text-gray-900 dark:text-white">
                  {orderDetails.sessionId}
                </span>
              </div>
            </div>
          </div>

          {/* Product Access */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
              Accès à votre produit
            </h3>
            <p className="text-blue-700 dark:text-blue-300 mb-6">
              {orderDetails.product.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => window.open('https://canva.com', '_blank')}
                icon={ExternalLink}
                className="flex-1"
              >
                Ouvrir dans Canva
              </Button>
              <Button
                variant="outline"
                icon={Download}
                className="flex-1"
              >
                Télécharger le guide
              </Button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Prochaines étapes
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Vous devriez recevoir un email de confirmation avec tous les détails de votre achat.
              Si vous avez des questions, n'hésitez pas à nous contacter.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button variant="outline" icon={ArrowLeft}>
                  Retour à l'accueil
                </Button>
              </Link>
              <a href="mailto:Vadshlouhim@gmail.com">
                <Button>
                  Nous contacter
                </Button>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};