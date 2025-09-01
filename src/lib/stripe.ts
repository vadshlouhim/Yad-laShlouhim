import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Payment functionality will be limited.');
}

export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export const formatPrice = (cents: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(cents / 100);
};

export const validateStripeConfig = (): boolean => {
  return !!stripePublishableKey;
};