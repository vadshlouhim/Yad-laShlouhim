-- Script de vérification de la structure de base de données après nettoyage
-- À exécuter APRÈS le script de nettoyage pour vérifier le résultat

-- 1. Lister toutes les tables restantes
SELECT 
    table_name,
    table_type,
    is_insertable_into
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Vérifier les tables principales qui doivent rester
SELECT 
    'categories' as table_name,
    count(*) as row_count,
    'Catégories des affiches' as description
FROM categories
UNION ALL
SELECT 
    'posters' as table_name,
    count(*) as row_count,
    'Données des affiches' as description  
FROM posters
UNION ALL
SELECT 
    'purchases' as table_name,
    count(*) as row_count,
    'Achats (table principale fonctionnelle)' as description
FROM purchases
UNION ALL
SELECT 
    'featured_posters' as table_name,
    count(*) as row_count,
    'Affiches en vedette' as description
FROM featured_posters;

-- 3. Vérifier que les tables supprimées n'existent plus
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') 
        THEN '❌ invoices existe encore' 
        ELSE '✅ invoices supprimée'
    END as invoices_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices_settings') 
        THEN '❌ invoices_settings existe encore' 
        ELSE '✅ invoices_settings supprimée'
    END as invoices_settings_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') 
        THEN '❌ orders existe encore' 
        ELSE '✅ orders supprimée'
    END as orders_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'purchase_intents') 
        THEN '❌ purchase_intents existe encore' 
        ELSE '✅ purchase_intents supprimée'
    END as purchase_intents_status;

-- 4. Afficher la taille de la base de données (optionnel)
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;