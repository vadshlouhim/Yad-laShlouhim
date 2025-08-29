import { useState } from 'react';
import { ExternalLink, Copy, Mail, Receipt, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { PurchaseResponse } from '../../types';

interface SuccessPanelProps {
  purchase: PurchaseResponse;
  sessionId: string;
}

export const SuccessPanel = ({ purchase, sessionId }: SuccessPanelProps) => {
  const [emailSent, setEmailSent] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(purchase.canva_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSendEmail = async () => {
    setIsLoadingEmail(true);
    try {
      // Vérifier si EmailJS est configuré
      if (!import.meta.env.VITE_EMAILJS_SERVICE_ID) {
        alert('EmailJS n\'est pas encore configuré. Contactez l\'administrateur.');
        return;
      }

      const response = await fetch('/.netlify/functions/sendPurchaseEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (response.ok) {
        setEmailSent(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Email sending failed');
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      alert(`Erreur lors de l'envoi de l'email: ${error.message}`);
    } finally {
      setIsLoadingEmail(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Paiement confirmé ✅
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Voici votre lien Canva pour <strong>{purchase.poster_title}</strong>
        </p>
      </div>

      {/* Canva Link Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Votre lien Canva est prêt
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => window.open(purchase.canva_link, '_blank')}
            icon={ExternalLink}
            size="lg"
            className="flex-1"
          >
            Ouvrir dans Canva
          </Button>
          <Button
            onClick={handleCopyLink}
            icon={Copy}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            {copied ? 'Copié !' : 'Copier le lien'}
          </Button>
        </div>
      </div>

      {/* Email Option */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Voulez-vous recevoir ce lien par email ?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Nous vous enverrons le lien Canva et votre reçu par email.
        </p>
        
        {!emailSent ? (
          <Button
            onClick={handleSendEmail}
            loading={isLoadingEmail}
            icon={Mail}
            variant="secondary"
          >
            Me l'envoyer par email
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle size={20} />
            <span className="font-medium">Email envoyé avec succès !</span>
          </div>
        )}
      </div>

      {/* Receipt Link */}
      {purchase.receipt_url && (
        <div className="text-center">
          <Button
            onClick={() => window.open(purchase.receipt_url!, '_blank')}
            icon={Receipt}
            variant="ghost"
          >
            Télécharger mon reçu Stripe
          </Button>
        </div>
      )}
    </div>
  );
};