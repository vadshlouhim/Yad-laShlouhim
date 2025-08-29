import { useState } from 'react';
import { X, ShoppingBag, Info, Mail, Phone, Building2, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

interface PurchaseModalProps {
  posterId: string;
  posterImage?: string;
  posterTitle?: string;
  priceLabel: string;
  onClose: () => void;
}

export const PurchaseModal = ({ posterId, posterImage, posterTitle, priceLabel, onClose }: PurchaseModalProps) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    phone: '',
    organization: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur quand l'utilisateur tape
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    console.log('=== DEBUT PROCESSUS ACHAT ===');
    console.log('📝 Poster ID:', posterId);
    console.log('👤 Données client:', formData);
    
    try {
      // Validation côté client
      if (!formData.customer_name.trim()) {
        throw new Error('Le nom est requis');
      }
      if (!formData.customer_email.trim()) {
        throw new Error('L\'email est requis');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
        throw new Error('Format d\'email invalide');
      }

      console.log('💳 Création du checkout Stripe...');
      
      const checkoutResponse = await fetch('/.netlify/functions/createCheckout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          posterId,
          customerData: {
            customer_name: formData.customer_name.trim(),
            customer_email: formData.customer_email.trim(),
            phone: formData.phone.trim() || null,
            organization: formData.organization.trim() || null,
            notes: formData.notes.trim() || null,
          }
        })
      });
      
      console.log('📡 Réponse checkout:', checkoutResponse.status);
      
      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json();
        console.error('❌ Erreur checkout:', errorData);
        throw new Error(errorData.error || `Erreur HTTP ${checkoutResponse.status}`);
      }
      
      const checkoutData = await checkoutResponse.json();
      console.log('✅ Checkout créé:', checkoutData);
      
      if (checkoutData.url) {
        console.log('🚀 Redirection vers Stripe:', checkoutData.url);
        window.location.href = checkoutData.url;
      } else {
        throw new Error('URL de checkout manquante');
      }
      
    } catch (error) {
      console.error('❌ Erreur processus achat:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-0">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl mx-2 sm:mx-4 max-h-[95vh] sm:max-h-none overflow-y-auto sm:overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Achat d'affiche</p>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{posterTitle || 'Affiche'}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 flex-shrink-0">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left - Poster Preview */}
          <div className="p-3 sm:p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
            <div className="rounded-xl overflow-hidden shadow-lg">
              {posterImage ? (
                <img src={posterImage} alt={posterTitle} className="w-full aspect-[4/5] object-cover" />
              ) : (
                <div className="w-full aspect-[4/5] bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20" />
              )}
            </div>
            <div className="mt-3 sm:mt-4">
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Processus d'achat en 3 étapes</span>
                <span className="sm:hidden">3 étapes</span>
              </div>
              <ol className="mt-2 sm:mt-3 space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <li><span className="hidden sm:inline">1. Remplissez vos informations</span><span className="sm:hidden">1. Vos infos</span></li>
                <li><span className="hidden sm:inline">2. Payez en toute sécurité ({priceLabel})</span><span className="sm:hidden">2. Paiement ({priceLabel})</span></li>
                <li><span className="hidden sm:inline">3. Recevez instantanément le lien Canva par email</span><span className="sm:hidden">3. Email + Canva</span></li>
              </ol>
            </div>
          </div>

          {/* Right - Form */}
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {/* Affichage d'erreur */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                  ❌ {error}
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-1">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  name="customer_name" 
                  value={formData.customer_name} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-9 sm:pl-11 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" 
                  placeholder="Votre nom complet" 
                />
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  name="customer_email" 
                  type="email" 
                  value={formData.customer_email} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-9 sm:pl-11 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" 
                  placeholder="vous@email.fr" 
                />
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-1">
                Téléphone (optionnel)
              </label>
              <div className="relative">
                <input 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-9 sm:pl-11 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" 
                  placeholder="06 XX XX XX XX" 
                />
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-1">
                Organisation (optionnel)
              </label>
              <div className="relative">
                <input 
                  name="organization" 
                  value={formData.organization} 
                  onChange={handleChange} 
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-9 sm:pl-11 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" 
                  placeholder="Votre entreprise/organisation" 
                />
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-1">
                Notes pour votre commande (optionnel)
              </label>
              <textarea 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                rows={3} 
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-none" 
                placeholder="Informations supplémentaires sur votre événement..." 
              />
            </div>

            {/* Info importante */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                <strong>📧 Après paiement :</strong> Vous recevrez immédiatement un email avec votre lien Canva et votre facture.
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={submitting || !formData.customer_name.trim() || !formData.customer_email.trim()} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 sm:py-3 text-sm sm:text-base"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Traitement...
                </div>
              ) : (
                `Procéder au paiement (${priceLabel})`
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};