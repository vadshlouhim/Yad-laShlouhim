import { useState } from 'react';
import { MessageCircle, Phone, X } from 'lucide-react';

export const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const phoneNumber = '+33667288851';
  const baseMessage = "Bonjour Yad La'Shlouhim ! 👋\n\nJ'ai découvert vos magnifiques affiches sur votre site et j'aimerais en savoir plus.\n\nPourriez-vous m'aider à choisir le modèle parfait pour mon événement ?\n\nMerci ! 😊";
  
  const handleWhatsAppMessage = () => {
    const encodedMessage = encodeURIComponent(baseMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\s+/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const handleWhatsAppCall = () => {
    const telUrl = `tel:${phoneNumber}`;
    window.location.href = telUrl;
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Options Menu */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[280px] animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Contacter Yad La'Shlouhim
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleWhatsAppMessage}
                className="w-full flex items-center gap-3 p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors duration-200"
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Envoyer un message</p>
                  <p className="text-sm opacity-90">WhatsApp</p>
                </div>
              </button>
              
              <button
                onClick={handleWhatsAppCall}
                className="w-full flex items-center gap-3 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-200"
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Appeler directement</p>
                  <p className="text-sm opacity-90">+33 6 67 28 88 51</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isOpen ? 'rotate-45 scale-110' : 'hover:scale-110 animate-float'
          }`}
          aria-label="Contact WhatsApp"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </button>

        {/* Pulse Animation */}
        {!isOpen && (
          <div className="absolute inset-0 w-14 h-14 bg-green-400 rounded-full animate-ping opacity-20" />
        )}

        {/* Zone de clic invisible par-dessus l'animation */}
        <div 
          className="absolute inset-0 w-14 h-14 rounded-full z-10 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Contact WhatsApp"
        />
      </div>
    </>
  );
};