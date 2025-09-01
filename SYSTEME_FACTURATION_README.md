# 📄 Système de Facturation - Yad La'Shlouhim

## 🎯 Vue d'ensemble

Ce système de facturation permet aux clients de :
- Télécharger leurs factures PDF professionnelles
- Recevoir leurs factures par email avec le lien Canva inclus
- Avoir un suivi complet de leurs achats

## 🏗️ Architecture

### Tables créées :
- **`invoices`** : Stockage des factures avec toutes les métadonnées
- **`invoice_settings`** : Paramètres de l'entreprise (nom, adresse, TVA, etc.)

### Fonctions Supabase Edge :
- **`generate-invoice`** : Génération HTML de la facture
- **`generate-invoice-pdf`** : Génération PDF avec stockage
- **`send-invoice-email`** : Envoi email professionnel avec facture

### Frontend :
- **Bouton "Télécharger la facture"** : Génère et ouvre la facture PDF
- **Bouton "Envoyer par email"** : Envoie un email professionnel avec facture

## 🚀 Instructions de déploiement

### 1. Migration de la base de données

```bash
# Connectez-vous à Supabase Dashboard
# Allez dans SQL Editor
# Copiez et exécutez le contenu de :
supabase/migrations/20250901_create_invoices_system.sql
```

### 2. Déploiement des fonctions Supabase Edge

```bash
# Déployez toutes les nouvelles fonctions
supabase functions deploy generate-invoice
supabase functions deploy generate-invoice-pdf  
supabase functions deploy send-invoice-email
```

### 3. Configuration des variables d'environnement

#### Variables requises dans Supabase :

```bash
# Pour les emails (Resend - recommandé)
RESEND_API_KEY=your_resend_api_key

# Pour la génération PDF (optionnel - htmlcsstoimage.com)
HTMLCSSTOIMAGE_API_KEY=your_htmlcsstoimage_api_key

# Variables déjà configurées
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EMAILJS_SERVICE_ID=your_emailjs_service_id (fallback)
EMAILJS_PUBLIC_KEY=your_emailjs_public_key (fallback)
```

### 4. Configuration du stockage Supabase

```sql
-- Créer le bucket pour les factures PDF
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoices', 'invoices', true);

-- Politique d'accès public en lecture
CREATE POLICY "Public read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'invoices');

-- Politique d'upload pour les fonctions authentifiées
CREATE POLICY "Authenticated upload access" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'invoices' AND auth.role() = 'service_role');
```

## ⚙️ Configuration de l'entreprise

### Modifier les informations de l'entreprise :

```sql
-- Mise à jour des informations dans invoice_settings
UPDATE invoice_settings SET 
  company_name = 'Yad La''Shlouhim',
  company_address = 'Votre adresse complète',
  company_city = 'Votre ville',
  company_postal_code = 'Code postal',
  company_country = 'France',
  company_email = 'contact@yad-lashlouhim.com',
  company_phone = '+33 X XX XX XX XX',
  company_siret = 'Votre SIRET',
  company_vat_number = 'Votre numéro TVA',
  logo_url = 'https://votre-logo.com/logo.png' -- optionnel
;
```

## 🎨 Personnalisation

### Modifier le template de facture :
- Editez `supabase/functions/generate-invoice-pdf/index.ts`
- Fonction `generateInvoiceHTML()` pour le design

### Modifier l'email professionnel :
- Editez `supabase/functions/send-invoice-email/index.ts`
- Fonction `generateInvoiceEmailTemplate()` pour le contenu

## 📧 Configuration email (Recommandée : Resend)

### Pourquoi Resend ?
- ✅ Support des pièces jointes PDF
- ✅ Délivrabilité excellente  
- ✅ API simple et fiable
- ✅ Domaines personnalisés faciles

### Configuration Resend :

1. **Créer un compte sur [resend.com](https://resend.com)**
2. **Ajouter votre domaine :**
   ```
   Domaine : yad-lashlouhim.com
   ```
3. **Récupérer votre API key**
4. **Ajouter dans Supabase Dashboard > Settings > Edge Functions :**
   ```
   RESEND_API_KEY=re_xxxxxxxxxx
   ```

### Fallback EmailJS :
Si Resend n'est pas configuré, le système utilise EmailJS automatiquement.

## 🧪 Tests

### Tester la génération de facture :
```bash
# Test de l'API avec curl
curl -X POST 'https://your-project.supabase.co/functions/v1/generate-invoice-pdf' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer YOUR_ANON_KEY' \
-d '{"sessionId": "cs_test_xxx"}'
```

### Tester l'envoi d'email :
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/send-invoice-email' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer YOUR_ANON_KEY' \
-d '{"sessionId": "cs_test_xxx"}'
```

## 🔄 Workflow complet

1. **Client effectue un paiement Stripe** 
2. **Redirection vers page de succès**
3. **Client clique sur "Télécharger facture"** → PDF généré et ouvert
4. **Client clique sur "Envoyer par email"** → Email professionnel envoyé avec PDF
5. **Facture stockée en base** avec suivi des envois

## 📊 Suivi et analytics

### Requêtes utiles :

```sql
-- Factures envoyées aujourd'hui
SELECT COUNT(*) FROM invoices 
WHERE email_sent = true 
AND DATE(email_sent_at) = CURRENT_DATE;

-- Factures par mois
SELECT 
  DATE_TRUNC('month', created_at) as mois,
  COUNT(*) as nb_factures,
  SUM(total_amount_cents)/100 as total_euros
FROM invoices 
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mois DESC;

-- Taux d'envoi d'emails
SELECT 
  COUNT(*) as total_factures,
  COUNT(CASE WHEN email_sent THEN 1 END) as emails_envoyes,
  ROUND(COUNT(CASE WHEN email_sent THEN 1 END) * 100.0 / COUNT(*), 2) as taux_envoi
FROM invoices;
```

## 🆘 Dépannage

### Problème : PDF ne se génère pas
- Vérifiez `HTMLCSSTOIMAGE_API_KEY` dans Supabase
- Alternative : le système affiche la version HTML

### Problème : Email ne s'envoie pas
- Vérifiez `RESEND_API_KEY` ou configuration EmailJS
- Consultez les logs dans Supabase Dashboard > Edge Functions

### Problème : Facture ne s'affiche pas
- Vérifiez que la migration SQL a été appliquée
- Vérifiez les permissions RLS sur les tables

## 🎉 Fonctionnalités bonus

### Auto-génération des numéros de facture :
Format : `YLS-2025-0001`, `YLS-2025-0002`, etc.

### Calcul automatique TVA :
Le système calcule automatiquement la TVA selon le taux configuré (20% par défaut).

### Cache PDF intelligent :
Les PDFs sont mis en cache 24h pour éviter les régénérations inutiles.

### Email professionnel :
Template email responsive avec design professionnel et informations complètes.

---

## 🏁 Résultat final

Après déploiement, vos clients auront sur la page post-paiement :

1. **Section Canva** (existante)
   - Bouton "Ouvrir dans Canva"
   - Bouton "Copier le lien"

2. **Section Email** (existante) 
   - Bouton "Me l'envoyer par email" (lien Canva simple)

3. **🆕 Section Facture** (nouvelle)
   - Bouton "Télécharger la facture" (PDF professionnel)
   - Bouton "Envoyer par email" (email avec facture + lien Canva)

Le tout avec un design cohérent et une expérience utilisateur optimale ! 🚀