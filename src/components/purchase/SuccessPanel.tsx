import { useState } from 'react';
import { ExternalLink, Copy, Mail, Receipt, CheckCircle, MessageCircle } from 'lucide-react';
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

  const handleWhatsAppProfessional = () => {
    const phoneNumber = '+33667288851';
    const professionalMessage = `Bonjour Yad La'Shlouhim ! 👋

Je viens de commander l'affiche "${purchase.poster_title}" et j'aimerais faire appel à vos services de personnalisation professionnelle.

Pouvez-vous m'aider à l'adapter selon mes besoins spécifiques ?

Merci ! 😊`;
    
    const encodedMessage = encodeURIComponent(professionalMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\s+/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSendEmail = async () => {
    setIsLoadingEmail(true);
    try {
      // Vérifier si EmailJS est configuré
      if (!import.meta.env.VITE_EMAILJS_SERVICE_ID) {
        alert('EmailJS n\'est pas encore configuré. Contactez l\'administrateur.');
        return;
      }

      // Try Netlify function first, fallback to Supabase edge function
      let response;
      try {
        response = await fetch('/.netlify/functions/sendPurchaseEmail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
      } catch (netlifyError) {
        console.log('Netlify function failed, trying Supabase edge function...');
        
        response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-purchase-email`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ sessionId })
        });
      }

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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Mail className="text-blue-600" size={20} />
          Recevoir par email
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Nous vous enverrons <strong>le lien Canva + votre facture Stripe officielle</strong> par email.
        </p>
        
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            📧 <strong>L'email contiendra :</strong>
            <br />• Votre lien Canva personnalisé
            <br />• Votre facture officielle Stripe (PDF)
            <br />• Toutes les informations de votre achat
          </p>
        </div>
        
        {!emailSent ? (
          <Button
            onClick={handleSendEmail}
            loading={isLoadingEmail}
            icon={Mail}
            variant="secondary"
            size="lg"
          >
            📧 Envoyer le lien Canva + Facture
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle size={20} />
            <span className="font-medium">Email avec facture envoyé avec succès !</span>
          </div>
        )}
      </div>

      {/* Stripe Invoice Section */}
      {purchase.receipt_url && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Receipt className="text-green-600" size={20} />
            Votre facture officielle Stripe
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Téléchargez votre facture officielle générée automatiquement par Stripe.
          </p>
          
          <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
            <p className="text-sm text-green-800 dark:text-green-300">
              ✅ <strong>Facture Stripe inclut :</strong>
              <br />• Informations complètes du paiement
              <br />• Calcul automatique des taxes
              <br />• Format PDF professionnel
              <br />• Numérotation officielle Stripe
            </p>
          </div>

          <div className="text-center">
            <Button
              onClick={() => window.open(purchase.receipt_url!, '_blank')}
              icon={Receipt}
              variant="secondary"
              size="lg"
            >
              📄 Télécharger ma facture Stripe
            </Button>
          </div>
        </div>
      )}

      {/* Professional Services Section */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <MessageCircle className="text-orange-600" size={20} />
          Services de personnalisation
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
          Trop occupé ? Demandez à un professionnel de personnaliser cette affiche pour vous !
        </p>
        
        <div className="text-center">
          <Button
            onClick={handleWhatsAppProfessional}
            icon={MessageCircle}
            variant="secondary"
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
          >
            💬 Contacter un professionnel
          </Button>
        </div>
      </div>
    </div>
  );
};