/*
  # Système d'achat complet pour Yad La'Shlouhim

  Ce fichier SQL crée toute l'infrastructure nécessaire pour le système d'achat :

  ## 1. Tables principales
  - `orders` : Toutes les commandes avec informations client
  - `purchases` : Achats validés après paiement Stripe
  - `purchase_intents` : Intentions d'achat avant paiement

  ## 2. Fonctions automatiques
  - Mise à jour automatique des timestamps
  - Contraintes de validation des données

  ## 3. Sécurité
  - Row Level Security (RLS) activé
  - Accès public limité aux données nécessaires
  - Protection des données sensibles

  ## 4. Index de performance
  - Index sur les emails clients
  - Index sur les sessions Stripe
  - Index sur les statuts de paiement

  ## Instructions d'utilisation :
  1. Copiez ce code dans Supabase Dashboard → SQL Editor
  2. Cliquez sur "Run" pour exécuter
  3. Vérifiez que toutes les tables sont créées
*/

-- =====================================================
-- 1. FONCTION POUR MISE À JOUR AUTOMATIQUE DES TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 2. TABLE DES COMMANDES (ORDERS)
-- =====================================================

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
  quantity integer NOT NULL DEFAULT 1,
  unit_price_cents integer NOT NULL,
  total_price_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  payment_status text NOT NULL DEFAULT 'pending',
  canva_link_sent boolean DEFAULT false,
  canva_link_sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_poster_id ON orders(poster_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Trigger pour mise à jour automatique
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. TABLE DES ACHATS VALIDÉS (PURCHASES)
-- =====================================================

CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text UNIQUE NOT NULL,
  poster_id uuid NOT NULL REFERENCES posters(id),
  customer_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  receipt_url text,
  canva_link text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session_id ON purchases(stripe_session_id);

-- =====================================================
-- 4. TABLE DES INTENTIONS D'ACHAT (PURCHASE_INTENTS)
-- =====================================================

CREATE TABLE IF NOT EXISTS purchase_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id uuid NOT NULL REFERENCES posters(id) ON DELETE CASCADE,
  customer_name text,
  customer_email text,
  phone text,
  organization text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 5. SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_intents ENABLE ROW LEVEL SECURITY;

-- Politique pour les commandes (orders)
DROP POLICY IF EXISTS "No public access to orders" ON orders;
CREATE POLICY "No public access to orders"
  ON orders
  FOR ALL
  TO anon
  USING (false);

-- Politique pour les achats (purchases)
DROP POLICY IF EXISTS "No public access to purchases" ON purchases;
CREATE POLICY "No public access to purchases"
  ON purchases
  FOR ALL
  TO anon
  USING (false);

-- Politique pour les intentions d'achat (purchase_intents)
DROP POLICY IF EXISTS "Anonymous can insert purchase intents" ON purchase_intents;
CREATE POLICY "Anonymous can insert purchase intents"
  ON purchase_intents
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- =====================================================
-- 6. VÉRIFICATION ET VALIDATION
-- =====================================================

-- Vérifier que toutes les tables existent
DO $$
BEGIN
    -- Vérifier la table orders
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        RAISE EXCEPTION 'Table orders non créée !';
    END IF;
    
    -- Vérifier la table purchases
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'purchases') THEN
        RAISE EXCEPTION 'Table purchases non créée !';
    END IF;
    
    -- Vérifier la table purchase_intents
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'purchase_intents') THEN
        RAISE EXCEPTION 'Table purchase_intents non créée !';
    END IF;
    
    RAISE NOTICE '✅ Toutes les tables ont été créées avec succès !';
    RAISE NOTICE '✅ Système d''achat prêt à fonctionner !';
END $$;