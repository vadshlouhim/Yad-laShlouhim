/*
  # Correction des permissions administrateur et structure des affiches

  1. Permissions
    - Permettre toutes les opérations pour les utilisateurs authentifiés
    - Ajouter des politiques spécifiques pour l'administration
  
  2. Structure des affiches
    - Vérifier que la colonne is_featured existe
    - Ajouter les contraintes et triggers nécessaires
  
  3. Sécurité
    - Maintenir RLS mais avec permissions admin complètes
*/

-- 1. S'assurer que la colonne is_featured existe
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posters' AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE posters ADD COLUMN is_featured boolean DEFAULT false;
        RAISE NOTICE 'Colonne is_featured ajoutée à la table posters';
    ELSE
        RAISE NOTICE 'Colonne is_featured existe déjà';
    END IF;
END $$;

-- 2. Créer un index pour les affiches favorites
CREATE INDEX IF NOT EXISTS idx_posters_featured 
ON posters (is_featured, is_published);

-- 3. Fonction pour limiter le nombre d'affiches favorites à 4
CREATE OR REPLACE FUNCTION limit_featured_posters()
RETURNS TRIGGER AS $$
BEGIN
    -- Si on essaie de mettre is_featured à true
    IF NEW.is_featured = true AND (OLD.is_featured IS NULL OR OLD.is_featured = false) THEN
        -- Compter le nombre d'affiches déjà favorites
        IF (SELECT COUNT(*) FROM posters WHERE is_featured = true AND id != NEW.id) >= 4 THEN
            RAISE EXCEPTION 'Vous ne pouvez avoir que 4 affiches favorites maximum. Retirez d''abord une affiche des favorites.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer le trigger pour limiter les affiches favorites
DROP TRIGGER IF EXISTS trigger_limit_featured_posters ON posters;
CREATE TRIGGER trigger_limit_featured_posters
    BEFORE UPDATE ON posters
    FOR EACH ROW
    EXECUTE FUNCTION limit_featured_posters();

-- 5. Fonction pour vérifier la limite lors de l'insertion
CREATE OR REPLACE FUNCTION check_featured_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_featured = true THEN
        IF (SELECT COUNT(*) FROM posters WHERE is_featured = true) >= 4 THEN
            RAISE EXCEPTION 'Vous ne pouvez avoir que 4 affiches favorites maximum.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger pour les nouvelles affiches
DROP TRIGGER IF EXISTS check_featured_limit_trigger ON posters;
CREATE TRIGGER check_featured_limit_trigger
    BEFORE INSERT ON posters
    FOR EACH ROW
    EXECUTE FUNCTION check_featured_limit();

-- 7. Mettre à jour les politiques RLS pour permettre l'administration complète
DROP POLICY IF EXISTS "posters_admin_access" ON posters;
CREATE POLICY "posters_admin_access"
ON posters
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 8. Politique pour la lecture publique des affiches publiées
DROP POLICY IF EXISTS "posters_public_read_published" ON posters;
CREATE POLICY "posters_public_read_published"
ON posters
FOR SELECT
TO public
USING (is_published = true);

-- 9. Politique spécifique pour la lecture du statut featured
DROP POLICY IF EXISTS "Allow read featured status for all users" ON posters;
CREATE POLICY "Allow read featured status for all users"
ON posters
FOR SELECT
TO public
USING (true);

-- 10. Politique pour la mise à jour du statut featured
DROP POLICY IF EXISTS "Allow update featured status for authenticated users" ON posters;
CREATE POLICY "Allow update featured status for authenticated users"
ON posters
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 11. Vérifier que les contraintes de clés étrangères existent
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_posters_category_id' 
        AND table_name = 'posters'
    ) THEN
        ALTER TABLE posters 
        ADD CONSTRAINT fk_posters_category_id 
        FOREIGN KEY (category_id) 
        REFERENCES categories(id) 
        ON DELETE CASCADE;
        RAISE NOTICE 'Contrainte de clé étrangère ajoutée';
    ELSE
        RAISE NOTICE 'Contrainte de clé étrangère existe déjà';
    END IF;
END $$;

-- 12. Ajouter un index pour les catégories
CREATE INDEX IF NOT EXISTS idx_posters_category_id ON posters (category_id);

-- 13. Vérification finale
DO $$
DECLARE
    featured_count INTEGER;
    total_posters INTEGER;
    total_categories INTEGER;
BEGIN
    SELECT COUNT(*) INTO featured_count FROM posters WHERE is_featured = true;
    SELECT COUNT(*) INTO total_posters FROM posters;
    SELECT COUNT(*) INTO total_categories FROM categories;
    
    RAISE NOTICE 'Vérification finale:';
    RAISE NOTICE '- Affiches favorites: % sur 4 maximum', featured_count;
    RAISE NOTICE '- Total affiches: %', total_posters;
    RAISE NOTICE '- Total catégories: %', total_categories;
    
    IF featured_count > 4 THEN
        RAISE WARNING 'ATTENTION: Plus de 4 affiches favorites détectées!';
    END IF;
END $$;