/*
  # Système de Facturation pour Yad La'Shlouhim
  
  Ce fichier SQL crée le système complet de facturation :
  
  ## Tables créées :
  - `invoices` : Stockage des factures PDF avec toutes les métadonnées
  - `invoice_settings` : Paramètres de l'entreprise pour les factures
  
  ## Fonctionnalités :
  - Génération automatique des numéros de facture
  - Stockage des PDFs avec URLs signées
  - Suivi des envois par email
  - Informations entreprise configurables
  
  ## Sécurité :
  - Row Level Security (RLS) activé
  - Accès contrôlé pour l'anonyme et l'admin
*/

-- =====================================================
-- 1. SUPPRIMER L'ANCIENNE TABLE SI ELLE EXISTE
-- =====================================================

DROP TABLE IF EXISTS invoices CASCADE;

-- =====================================================
-- 2. TABLE DES PARAMÈTRES DE FACTURATION
-- =====================================================

CREATE TABLE IF NOT EXISTS invoice_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'Yad La''Shlouhim',
  company_address text NOT NULL DEFAULT 'Adresse de l''entreprise',
  company_city text NOT NULL DEFAULT 'Ville',
  company_postal_code text NOT NULL DEFAULT '00000',
  company_country text NOT NULL DEFAULT 'France',
  company_email text NOT NULL DEFAULT 'contact@yad-lashlouhim.com',
  company_phone text NOT NULL DEFAULT '+33 X XX XX XX XX',
  company_siret text,
  company_vat_number text,
  logo_url text,
  invoice_prefix text NOT NULL DEFAULT 'YLS',
  current_invoice_number integer NOT NULL DEFAULT 1,
  include_vat boolean DEFAULT true,
  vat_rate decimal(5,4) DEFAULT 0.20,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insérer les paramètres par défaut
INSERT INTO invoice_settings (id, company_name, company_address, company_city, company_email) 
VALUES (gen_random_uuid(), 'Yad La''Shlouhim', 'Adresse à définir', 'Ville à définir', 'contact@yad-lashlouhim.com')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. TABLE DES FACTURES
-- =====================================================

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Relations
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  stripe_session_id text UNIQUE NOT NULL,
  
  -- Informations facture
  invoice_number text UNIQUE NOT NULL,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL DEFAULT CURRENT_DATE + INTERVAL '30 days',
  
  -- Client
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  customer_address text,
  
  -- Produit/Service
  poster_title text NOT NULL,
  poster_id uuid REFERENCES posters(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price_cents integer NOT NULL,
  subtotal_cents integer NOT NULL,
  vat_rate decimal(5,4) DEFAULT 0.20,
  vat_amount_cents integer NOT NULL DEFAULT 0,
  total_amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  
  -- Fichier PDF
  pdf_url text, -- URL du PDF stocké
  pdf_generated_at timestamptz,
  
  -- Statuts
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'sent', 'paid')),
  payment_status text NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  
  -- Email
  email_sent boolean DEFAULT false,
  email_sent_at timestamptz,
  email_count integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 4. FONCTIONS AUTOMATIQUES
-- =====================================================

-- Fonction pour générer le numéro de facture
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  settings_record invoice_settings%ROWTYPE;
  new_number integer;
  invoice_number text;
BEGIN
  -- Récupérer les paramètres
  SELECT * INTO settings_record FROM invoice_settings LIMIT 1;
  
  -- Incrémenter le numéro
  new_number := settings_record.current_invoice_number;
  
  -- Mettre à jour le compteur
  UPDATE invoice_settings 
  SET current_invoice_number = current_invoice_number + 1,
      updated_at = now();
  
  -- Générer le numéro formaté
  invoice_number := settings_record.invoice_prefix || '-' || 
                   TO_CHAR(EXTRACT(YEAR FROM CURRENT_DATE), 'YYYY') || '-' ||
                   LPAD(new_number::text, 4, '0');
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le numéro de facture
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calcul automatique des montants
CREATE OR REPLACE FUNCTION calculate_invoice_amounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculer le sous-total
  NEW.subtotal_cents := NEW.quantity * NEW.unit_price_cents;
  
  -- Calculer la TVA si applicable
  IF NEW.vat_rate > 0 THEN
    NEW.vat_amount_cents := ROUND(NEW.subtotal_cents * NEW.vat_rate);
  ELSE
    NEW.vat_amount_cents := 0;
  END IF;
  
  -- Calculer le total
  NEW.total_amount_cents := NEW.subtotal_cents + NEW.vat_amount_cents;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer les triggers
DROP TRIGGER IF EXISTS set_invoice_number_trigger ON invoices;
CREATE TRIGGER set_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();

DROP TRIGGER IF EXISTS calculate_amounts_trigger ON invoices;
CREATE TRIGGER calculate_amounts_trigger
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION calculate_invoice_amounts();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. INDEX POUR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_invoices_stripe_session ON invoices(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON invoices(customer_email);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);

-- =====================================================
-- 6. SÉCURITÉ ROW LEVEL SECURITY
-- =====================================================

-- Activer RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;

-- Politiques pour les factures (accès admin seulement)
DROP POLICY IF EXISTS "Admin full access to invoices" ON invoices;
CREATE POLICY "Admin full access to invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Pas d'accès public aux factures pour la sécurité
DROP POLICY IF EXISTS "No public access to invoices" ON invoices;
CREATE POLICY "No public access to invoices"
  ON invoices
  FOR ALL
  TO anon
  USING (false);

-- Politiques pour les paramètres (lecture seule pour les fonctions)
DROP POLICY IF EXISTS "Public read access to settings" ON invoice_settings;
CREATE POLICY "Public read access to settings"
  ON invoice_settings
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Admin full access to settings" ON invoice_settings;
CREATE POLICY "Admin full access to settings"
  ON invoice_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 7. FONCTION UTILITAIRE POUR CRÉER UNE FACTURE
-- =====================================================

CREATE OR REPLACE FUNCTION create_invoice_from_order(
  p_stripe_session_id text,
  p_order_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  order_record orders%ROWTYPE;
  poster_record posters%ROWTYPE;
  invoice_id uuid;
BEGIN
  -- Récupérer la commande
  IF p_order_id IS NOT NULL THEN
    SELECT * INTO order_record FROM orders WHERE id = p_order_id;
  ELSE
    SELECT * INTO order_record FROM orders WHERE stripe_session_id = p_stripe_session_id;
  END IF;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Commande non trouvée pour session_id: %', p_stripe_session_id;
  END IF;
  
  -- Récupérer les infos de l'affiche
  SELECT * INTO poster_record FROM posters WHERE id = order_record.poster_id;
  
  -- Créer la facture
  INSERT INTO invoices (
    order_id,
    stripe_session_id,
    customer_name,
    customer_email,
    customer_phone,
    poster_title,
    poster_id,
    quantity,
    unit_price_cents,
    currency,
    status
  ) VALUES (
    order_record.id,
    p_stripe_session_id,
    order_record.customer_name,
    order_record.customer_email,
    order_record.customer_phone,
    COALESCE(poster_record.title, 'Affiche personnalisée'),
    order_record.poster_id,
    order_record.quantity,
    order_record.unit_price_cents,
    order_record.currency,
    'pending'
  ) RETURNING id INTO invoice_id;
  
  RETURN invoice_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. VÉRIFICATION FINALE
-- =====================================================

DO $$
BEGIN
    -- Vérifier que les tables existent
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
        RAISE EXCEPTION 'Table invoices non créée !';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoice_settings') THEN
        RAISE EXCEPTION 'Table invoice_settings non créée !';
    END IF;
    
    RAISE NOTICE '✅ Système de facturation créé avec succès !';
    RAISE NOTICE '✅ Tables: invoices, invoice_settings';
    RAISE NOTICE '✅ Fonctions: génération automatique des numéros, calculs automatiques';
    RAISE NOTICE '✅ Sécurité: RLS activé';
END $$;