export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'affiche-evenement-yad-lashlouhim',
    priceId: 'price_1S0pzc2dyqy0l4BDwDGYPzh7', // Votre vrai price_id Stripe
    name: 'Affiche Événement Yad La\'Shlouhim',
    description: '🎨 Design pro prêt à éditer sur Canva (2 min) 📣 Idéal pour événements, fêtes & annonces ✍️ 100 % personnalisable : textes, couleurs, photos⚡ Lien Canva instantané après paiement 🖨️📱 Formats A4/A3 & réseaux sociaux, usage illimité✨',
    mode: 'payment'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};