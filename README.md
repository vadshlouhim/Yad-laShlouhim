# Yad La'Shlouhim - Affiches Communautaires Juives

Site e-commerce moderne pour la vente de templates d'affiches communautaires juives avec intégration Canva.

## 🚀 Fonctionnalités

- **Catalogue d'affiches** avec filtres par catégories et recherche
- **Paiement Stripe** intégré avec checkout sécurisé
- **Accès immédiat** aux templates Canva après achat
- **Envoi d'emails** optionnel avec reçu Stripe
- **Interface admin** pour gérer affiches et catégories
- **Design moderne** avec mode sombre/clair et animations fluides

## 🛠 Stack Technique

- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS
- **Backend**: Fonctions Netlify serverless
- **Base de données**: Supabase (PostgreSQL)
- **Paiements**: Stripe Checkout
- **Emails**: EmailJS
- **Déploiement**: Netlify

## 📦 Installation

### 1. Cloner et installer les dépendances

```bash
npm install
```

### 2. Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Exécutez les migrations SQL dans `supabase/migrations/`
3. Récupérez vos clés API depuis les paramètres du projet

### 3. Configuration Stripe

1. Créez un compte [Stripe](https://stripe.com)
2. Récupérez vos clés API (test et production)
3. Configurez un webhook endpoint pointant vers `/.netlify/functions/stripeWebhook`
4. Activez l'événement `checkout.session.completed`

### 4. Configuration EmailJS

1. Créez un compte [EmailJS](https://www.emailjs.com)
2. Configurez un service email (Gmail, Outlook, etc.)
3. Créez un template d'email avec les variables :
   - `{{to_email}}` - Email du client
   - `{{poster_title}}` - Titre de l'affiche
   - `{{canva_link}}` - Lien vers le template Canva
   - `{{receipt_url}}` - Lien vers le reçu Stripe

### 5. Variables d'environnement

Copiez `.env.example` vers `.env` et remplissez vos valeurs :

```bash
cp .env.example .env
```

### 6. Lancement local

```bash
npm run dev
```

Le site sera accessible sur `http://localhost:5173`

## 🚀 Déploiement sur Netlify

### 1. Préparation

1. Connectez votre repository GitHub à Netlify
2. Configurez les variables d'environnement dans Netlify
3. Activez les fonctions Netlify

### 2. Configuration Build

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

### 3. Variables d'environnement Netlify

Ajoutez toutes les variables de `.env.example` dans :
Netlify Dashboard → Site Settings → Environment Variables

### 4. Configuration Stripe Webhook

Mettez à jour l'URL du webhook Stripe vers :
`https://your-site.netlify.app/.netlify/functions/stripeWebhook`

## 👤 Interface Admin

Accédez à `/admin` avec le mot de passe configuré dans `ADMIN_PASSWORD`.

### Fonctionnalités admin :
- **Catégories** : Créer, modifier, supprimer
- **Affiches** : CRUD complet avec upload d'images
- **Publication** : Contrôler la visibilité des affiches

## 🎨 Personnalisation Design

Le design utilise un système de couleurs cohérent défini dans `tailwind.config.js` :

- **Primary** : Bleu (#3B82F6 → #1E3A8A)
- **Secondary** : Teal (#14B8A6 → #134E4A)
- **Accent** : Orange (#F97316 → #7C2D12)
- **Success, Warning, Error** : Palettes complètes

### Animations et transitions
- Durées : 150-250ms
- Effets : scale, fade, slide
- Micro-interactions sur hover

## 🔒 Sécurité

- **RLS Supabase** : Accès public aux affiches publiées uniquement
- **Stripe Webhook** : Vérification de signature obligatoire
- **Admin** : Protection par mot de passe avec session storage
- **CORS** : Configuration appropriée pour les fonctions

## 📱 Responsive Design

- **Mobile** : 1-2 colonnes, menu burger
- **Tablet** : 3 colonnes, navigation adaptée  
- **Desktop** : 4 colonnes, interface complète

## 🧪 Tests de fonctionnement

1. **Catalogue** : Vérifier l'affichage des affiches avec prix
2. **Achat** : Tester le flow complet jusqu'au succès
3. **Canva** : Vérifier que les liens Canva sont accessibles
4. **Email** : Tester l'envoi d'email optionnel
5. **Admin** : Créer/modifier une affiche et vérifier la publication

## 📞 Support

Pour toute question technique, consultez la documentation des services utilisés :
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [EmailJS Docs](https://www.emailjs.com/docs/)
- [Netlify Docs](https://docs.netlify.com)