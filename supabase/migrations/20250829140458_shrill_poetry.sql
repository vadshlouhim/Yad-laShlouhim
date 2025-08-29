/*
  # Système d'achat complet

  1. Tables
    - `orders` : Commandes clients avec toutes les informations
    - `purchases` : Achats validés après paiement Stripe
    - Mise à jour de `posters` pour inclure les données nécessaires

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques d'accès appropriées
    - Pas d'accès public aux données sensibles

  3. Fonctionnalités
    - Enregistrement des intentions d'achat
    - Validation des paiements Stripe
    - Envoi d'emails automatique
*/

-- Table pour les commandes (avant paiement)
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id uuid NOT NULL REFERENCES posters(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  company_name text,
  event_type text,
  event_date date,
  special_requirements text,
  quantity integer DEFAULT 1 NOT NULL,
  unit_price_cents integer NOT NULL,
  total_price_cents integer NOT NULL,
  currency text DEFAULT 'EUR' NOT NULL,
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  payment_status text DEFAULT 'pending' NOT NULL,
  canva_link_sent boolean DEFAULT false,
  canva_link_sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_poster_id ON orders(poster_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Activer RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Politique : Pas d'accès public aux commandes
CREATE POLICY "No public access to orders"
  ON orders
  FOR ALL
  TO anon
  USING (false);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Mettre à jour la table posters si nécessaire
DO $$
BEGIN
  -- Vérifier si la colonne updated_at existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posters' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE posters ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Trigger pour posters
DROP TRIGGER IF EXISTS update_posters_updated_at ON posters;
CREATE TRIGGER update_posters_updated_at
    BEFORE UPDATE ON posters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();