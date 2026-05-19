<p align="center">
  <img src="public/favicon.svg#gh-light-mode-only" width="100" alt="Discheck" />
  <img src="public/favicon_white.svg#gh-dark-mode-only" width="100" alt="Discheck" />
</p>

# Discheck — DMD Lab

Tracker de discographie musicale. Explorez, cochez et notez chaque sortie de vos artistes préférés — inspiré de Letterboxd, mais pour la musique. Sans pub, sans abonnement.

[Voir la roadmap →](ROADMAP.md)

## Pourquoi cette app

Discheck est née d'un besoin simple : garder une trace de son parcours musical artiste par artiste. Sa discographie complète s'affiche (albums, EPs, singles), on coche ce qu'on a écouté, on note chaque titre. Pas de streaming, pas de recommandations algorithmiques — juste sa bibliothèque, ses écoutes, ses notes.

## Stack

Next.js · Tailwind CSS v4 · Supabase (PostgreSQL) · Deezer API · Vercel · Lucide React

## Couleurs

Primaire vert `#22c55e`

## Fonctionnalités

- Recherche d'artiste en temps réel (Deezer API, debounce 350ms)
- Discographie complète triée par date décroissante — albums, EPs, singles
- Filtres par type de sortie (Tout / Albums / EP / Singles)
- Timeline par année avec indicateurs de progression
- Panel slide-in pour explorer les titres d'une sortie
- Cocher un titre comme écouté (ou tout cocher d'un coup)
- Notation par titre de 1 à 5 avec couleurs sémantiques
- Note d'album = moyenne automatique des titres notés
- Barre de progression par sortie dans la discographie
- Page "Mes artistes" avec progression globale par artiste
- Thème sombre/clair (dark par défaut)
- Compte utilisateur (inscription email + pseudo, connexion, déconnexion)
- Transitions de pages fluides (View Transitions API)
- Skeleton loaders sur toutes les pages

## Variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

---

<p align="center">
  <sub>Une app créée par</sub><br/>
  <img src="public/dmdlab_logo_black.png#gh-light-mode-only" width="150" alt="DMD Lab" />
  <img src="public/dmdlab_logo_white.png#gh-dark-mode-only" width="150" alt="DMD Lab" />
</p>
