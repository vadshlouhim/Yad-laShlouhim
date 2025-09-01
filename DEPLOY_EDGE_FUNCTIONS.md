# 🚀 Guide de déploiement des Edge Functions Supabase

## ⚠️ Important
Les Edge Functions Supabase ne peuvent pas être déployées depuis cet environnement WebContainer. Vous devez les déployer depuis votre machine locale ou via GitHub Actions.

## 📋 Méthode 1: Déploiement local (Recommandé)

### 1. Installer le CLI Supabase
```bash
# Sur macOS
brew install supabase/tap/supabase

# Sur Windows (avec Chocolatey)
choco install supabase

# Sur Linux
curl -fsSL https://supabase.com/install.sh | sh
```

### 2. Se connecter à votre projet
```bash
# Initialiser Supabase dans votre projet
supabase init

# Se connecter à votre projet
supabase login

# Lier votre projet local au projet Supabase
supabase link --project-ref VOTRE_PROJECT_ID
```

### 3. Déployer les fonctions
```bash
# Déployer toutes les fonctions
supabase functions deploy

# Ou déployer une fonction spécifique
supabase functions deploy create-poster-checkout
supabase functions deploy poster-webhook
supabase functions deploy send-purchase-email
supabase functions deploy get-purchase-by-session
```

## 📋 Méthode 2: Via le Dashboard Supabase

### 1. Aller dans le Dashboard
- Connectez-vous à [supabase.com/dashboard](https://supabase.com/dashboard)
- Sélectionnez votre projet
- Allez dans **Edge Functions**

### 2. Créer les fonctions manuellement
Pour chaque fonction, cliquez sur "Create Function" et copiez le code :

#### create-poster-checkout
```typescript
// Copiez le contenu de supabase/functions/create-poster-checkout/index.ts
```

#### poster-webhook  
```typescript
// Copiez le contenu de supabase/functions/poster-webhook/index.ts
```

#### send-purchase-email
```typescript
// Copiez le contenu de supabase/functions/send-purchase-email/index.ts
```

#### get-purchase-by-session
```typescript
// Copiez le contenu de supabase/functions/get-purchase-by-session/index.ts
```

## 📋 Méthode 3: GitHub Actions (Automatique)

### 1. Créer le workflow
Créez `.github/workflows/deploy-functions.yml` :

```yaml
name: Deploy Edge Functions

on:
  push:
    branches: [main]
    paths: ['supabase/functions/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
          
      - name: Deploy functions
        run: supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

### 2. Configurer les secrets GitHub
Dans votre repo GitHub → Settings → Secrets :
- `SUPABASE_PROJECT_ID` : ID de votre projet Supabase
- `SUPABASE_ACCESS_TOKEN` : Token d'accès Supabase

## 🔧 Variables d'environnement nécessaires

Après déploiement, configurez ces variables dans Supabase Dashboard → Edge Functions → Settings :

```
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret
EMAILJS_SERVICE_ID=votre_service_id
EMAILJS_TEMPLATE_ID_PURCHASE=votre_template_id
EMAILJS_PUBLIC_KEY=votre_cle_publique
SITE_URL=https://votre-site.netlify.app
```

## ✅ Vérification du déploiement

Une fois déployées, testez vos fonctions :

1. **Dans le Dashboard Supabase** → Edge Functions → Cliquez sur une fonction → "Invoke"
2. **Ou via votre application** en essayant un achat test

## 🐛 En cas de problème

Si vous ne pouvez pas déployer les Edge Functions :

1. **Utilisez uniquement les fonctions Netlify** (qui sont déjà configurées)
2. **Modifiez le code** pour utiliser seulement les fonctions Netlify
3. **Ou contactez le support Supabase** pour l'aide au déploiement

## 📞 Besoin d'aide ?

- Documentation Supabase : https://supabase.com/docs/guides/functions
- Support Supabase : https://supabase.com/support