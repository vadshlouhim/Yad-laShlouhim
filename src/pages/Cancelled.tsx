import { Link } from 'react-router-dom';
import { ArrowLeft, XCircle } from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';

export const Cancelled = () => {
  return (
    <div className="py-12 min-h-screen">
      <Container>
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Paiement annulé
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Votre paiement a été annulé. Aucun montant n'a été débité.
          </p>

          <div className="space-y-4">
            <Link to="/nos-affiches">
              <Button size="lg" className="w-full">
                Retour aux affiches
              </Button>
            </Link>
            
            <Link to="/">
              <Button variant="ghost" icon={ArrowLeft}>
                Accueil
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};