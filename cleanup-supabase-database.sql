-- Script de nettoyage de la base de données Supabase
-- Supprime les tables inutiles et non fonctionnelles
-- À exécuter dans l'éditeur SQL de Supabase

-- Suppression des tables inutiles dans l'ordre (en respectant les contraintes de clés étrangères)

-- 1. Supprimer la table invoices_settings
DROP TABLE IF EXISTS invoices_settings CASCADE;

-- 2. Supprimer la table invoices
DROP TABLE IF EXISTS invoices CASCADE;

-- 3. Supprimer la table orders (non fonctionnelle)
DROP TABLE IF EXISTS orders CASCADE;

-- 4. Supprimer la table purchase_intents (vide et non utilisée)
DROP TABLE IF EXISTS purchase_intents CASCADE;

-- Optionnel : Supprimer les fonctions associées si elles existent
DROP FUNCTION IF EXISTS generate_invoice_number() CASCADE;
DROP FUNCTION IF EXISTS create_invoice_for_purchase(uuid) CASCADE;
DROP FUNCTION IF EXISTS update_invoice_settings(jsonb) CASCADE;

-- Optionnel : Supprimer les triggers associés si ils existent
DROP TRIGGER IF EXISTS trigger_create_invoice_after_purchase ON purchases CASCADE;
DROP TRIGGER IF EXISTS trigger_update_invoice_number ON invoices CASCADE;

-- Vérifier les tables restantes (commande d'information - ne supprime rien)
-- Décommentez les lignes suivantes pour voir les tables restantes après nettoyage :

-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

-- Afficher les tables principales qui doivent rester :
-- - categories (catégories des affiches)
-- - featured_posters (affiches en vedette) 
-- - posters (données des affiches)
-- - purchases (achats - table principale fonctionnelle)

COMMENT ON SCHEMA public IS 'Base de données nettoyée - Yad La''Shlouhim - Tables inutiles supprimées';