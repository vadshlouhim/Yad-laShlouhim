// Stripe utility functions for the frontend

export const formatStripeAmount = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

export const validateStripeConfig = (): boolean => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  return requiredEnvVars.every(envVar => !!import.meta.env[envVar]);
};

export const getStripeErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.error) {
    return error.error;
  }

  return 'Une erreur inattendue s\'est produite';
};

export const createCheckoutSession = async (
  posterId: string, 
  customerData: any
): Promise<{ url?: string; error?: string }> => {
  try {
    // Try Netlify function first
    let response;
    try {
      response = await fetch('/.netlify/functions/createCheckout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posterId, customerData })
      });
    } catch (netlifyError) {
      console.log('Netlify function failed, trying Supabase edge function...');
      
      // Fallback to Supabase edge function
      response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-poster-checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ posterId, customerData })
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { url: data.url };

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { error: getStripeErrorMessage(error) };
  }
};

export const getPurchaseBySession = async (sessionId: string): Promise<any> => {
  try {
    // Try Netlify function first
    let response;
    try {
      response = await fetch('/.netlify/functions/getPurchaseBySession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
    } catch (netlifyError) {
      console.log('Netlify function failed, trying Supabase edge function...');
      
      // Fallback to Supabase edge function
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

    return await response.json();
  } catch (error) {
    console.error('Error getting purchase:', error);
    throw error;
  }
};

export const sendPurchaseEmail = async (sessionId: string): Promise<boolean> => {
  try {
    // Try Netlify function first
    let response;
    try {
      response = await fetch('/.netlify/functions/sendPurchaseEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
    } catch (netlifyError) {
      console.log('Netlify function failed, trying Supabase edge function...');
      
      // Fallback to Supabase edge function
      response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-purchase-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ sessionId })
      });
    }

    return response.ok;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};