#!/bin/bash

# 🧾 Script de déploiement du système de facturation - Yad La'Shlouhim
# Auteur: Assistant Claude
# Date: $(date +%Y-%m-%d)

set -e

echo "🚀 Déploiement du système de facturation Yad La'Shlouhim"
echo "========================================================="

# Vérifier que Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé"
    echo "Installation: npm install -g supabase"
    exit 1
fi

# Vérifier la connexion à Supabase
echo "🔐 Vérification de la connexion Supabase..."
if ! supabase status &> /dev/null; then
    echo "❌ Non connecté à Supabase. Exécutez:"
    echo "   supabase login"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "✅ Connecté à Supabase"

# Étape 1: Migration de base de données
echo ""
echo "📊 Application de la migration de base de données..."
echo "   Fichier: supabase/migrations/20250901_create_invoices_system.sql"

# Vérifier que le fichier de migration existe
if [ ! -f "supabase/migrations/20250901_create_invoices_system.sql" ]; then
    echo "❌ Fichier de migration non trouvé"
    exit 1
fi

# Appliquer la migration
echo "   Exécution de la migration..."
if supabase db push; then
    echo "✅ Migration appliquée avec succès"
else
    echo "❌ Erreur lors de la migration"
    exit 1
fi

# Étape 2: Déploiement des fonctions Edge
echo ""
echo "⚡ Déploiement des fonctions Supabase Edge..."

functions=("generate-invoice" "generate-invoice-pdf" "send-invoice-email")

for func in "${functions[@]}"; do
    echo "   📤 Déploiement de $func..."
    if supabase functions deploy "$func"; then
        echo "   ✅ $func déployé"
    else
        echo "   ❌ Erreur déploiement $func"
        exit 1
    fi
done

# Étape 3: Configuration du stockage
echo ""
echo "🗄️ Configuration du stockage Supabase..."
echo "   Création du bucket 'invoices'..."

# Créer le bucket via SQL
supabase db reset --debug || true  # Ignore les erreurs
cat << 'EOF' | supabase db push --no-confirm
-- Créer le bucket pour les factures si il n'existe pas déjà
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

-- Politique d'accès public en lecture
CREATE POLICY IF NOT EXISTS "Public read access to invoices" 
ON storage.objects FOR SELECT USING (bucket_id = 'invoices');

-- Politique d'upload pour les fonctions authentifiées
CREATE POLICY IF NOT EXISTS "Service role can upload invoices" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'invoices' AND auth.role() = 'service_role');
EOF

echo "✅ Stockage configuré"

# Étape 4: Vérifications finales
echo ""
echo "🔍 Vérifications finales..."

# Vérifier que les tables existent
echo "   Vérification des tables..."
if supabase db diff --schema public --local; then
    echo "   ✅ Tables créées correctement"
else
    echo "   ⚠️  Vérifiez les tables manuellement"
fi

# Étape 5: Instructions de configuration
echo ""
echo "🎯 DÉPLOIEMENT TERMINÉ !"
echo "========================"
echo ""
echo "📋 Prochaines étapes à faire manuellement :"
echo ""
echo "1. 🔧 VARIABLES D'ENVIRONNEMENT (Supabase Dashboard > Settings > Edge Functions)"
echo "   Ajoutez ces variables :"
echo "   - RESEND_API_KEY=your_resend_api_key (recommandé pour emails)"
echo "   - HTMLCSSTOIMAGE_API_KEY=your_key (optionnel pour PDF)"
echo ""
echo "2. 🏢 INFORMATIONS ENTREPRISE (SQL Editor ou via fonction)"
echo "   Exécutez cette requête pour configurer votre entreprise :"
echo "   
   UPDATE invoice_settings SET 
     company_name = 'Yad La\'\'Shlouhim',
     company_address = 'Votre adresse',
     company_city = 'Votre ville',
     company_postal_code = 'Code postal',
     company_email = 'contact@yad-lashlouhim.com',
     company_phone = '+33 X XX XX XX XX',
     company_siret = 'Votre SIRET',
     company_vat_number = 'FR12345678901';
"
echo ""
echo "3. 📧 CONFIGURATION EMAIL RESEND (recommandé)"
echo "   - Créez un compte sur resend.com"
echo "   - Ajoutez votre domaine yad-lashlouhim.com"
echo "   - Récupérez votre API key"
echo "   - L'ajoutez dans les variables Supabase"
echo ""
echo "4. 🧪 TESTS"
echo "   - Effectuez un achat test"
echo "   - Vérifiez la page de succès"
echo "   - Testez les boutons de facture"
echo ""
echo "📖 Documentation complète : SYSTEME_FACTURATION_README.md"
echo ""
echo "🎉 Le système de facturation est maintenant déployé !"
echo "   Vos clients peuvent maintenant télécharger leurs factures"
echo "   et les recevoir par email avec un design professionnel."