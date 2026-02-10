# Impexo — Front e‑commerce React (style Apple)

Front-end React premium pour une marque de luxe “Impexo”, spécialisée dans la vente de coques d’iPhone haut de gamme.

## Stack

- React + TypeScript (Vite)
- Tailwind + shadcn-ui
- React Router
- React Query (données WooCommerce)
- Zustand (panier)
- Framer Motion (animations subtiles)

## Démarrer

```bash
npm i
npm run dev
```

Par défaut, si `VITE_WP_BASE_URL` n’est pas configuré, l’app utilise des **produits mock**.

## Configuration WordPress / WooCommerce (headless)

Copie `.env.example` en `.env` puis adapte :

```bash
VITE_WP_BASE_URL=https://ton-site-wordpress.com
VITE_WC_CONSUMER_KEY=ck_...
VITE_WC_CONSUMER_SECRET=cs_...
VITE_IMPEXO_USE_MOCKS=false
```

### Notes importantes (sécurité / prod)

- **Ne mets pas** `consumer_secret` dans un front public en production.
- Recommandé : un **proxy backend** (Edge Function / Node API) qui signe les requêtes WooCommerce et applique les règles d’accès.
- Vérifie aussi **CORS** côté WordPress.

## Routes

- `/` Accueil
- `/boutique` Boutique (grille + filtres)
- `/produit/:slug` Fiche produit (zoom + sélecteurs + ajout panier)
- `/panier` Panier
- `/contact` Support + FAQ

## Organisation du code

- `src/components/` UI & layout (Header/Footer, cards, animations)
- `src/pages/` Pages
- `src/hooks/` Hooks (React Query)
- `src/services/` API WooCommerce + env + mocks
- `src/store/` Zustand (panier)
- `src/utils/` helpers (prix, attributs)

