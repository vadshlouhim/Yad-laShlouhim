import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { SuccessPanel } from '../components/purchase/SuccessPanel';
import { PurchaseResponse } from '../types';

export const Success = () => {
  const [searchParams] = useSearchParams();
  const [purchase, setPurchase] = useState<PurchaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      loadPurchase(sessionId);
    } else {
      setError('Session ID manquante');
      setLoading(false);
    }
  }, [sessionId]);

  const loadPurchase = async (sessionId: string) => {
    try {
      // Try Netlify function first, fallback to Supabase edge function
      let response;
      try {
        response = await fetch('/.netlify/functions/getPurchaseBySession', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
      } catch (netlifyError) {
        console.log('Netlify function failed, trying Supabase edge function...');
        
        response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-purchase-by-session`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ sessionId })
        });
      }

      if (!response.ok) {
        throw new Error('Purchase not found');
      }

      const data = await response.json();
      setPurchase(data);
    } catch (error) {
      console.error('Error loading purchase:', error);
      setError('Achat non trouvé ou erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 min-h-screen">
      <Container>
        <div className="mb-8">
          <Link to="/nos-affiches">
            <Button variant="ghost" icon={ArrowLeft}>
              Retour aux affiches
            </Button>
          </Link>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Chargement de votre achat...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">
                Erreur
              </h2>
              <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
              <Link to="/nos-affiches">
                <Button variant="outline">
                  Retour aux affiches
                </Button>
              </Link>
            </div>
          </div>
        )}

        {purchase && sessionId && (
          <SuccessPanel purchase={purchase} sessionId={sessionId} />
        )}
      </Container>
    </div>
  );
};