<p align="center">
  <img src="public/favicon.svg#gh-light-mode-only" width="100" alt="Discheck" />
  <img src="public/favicon_white.svg#gh-dark-mode-only" width="100" alt="Discheck" />
</p>

# Discheck — DMD Lab

Tracker de discographie musicale. Explorez, cochez et notez chaque sortie de vos artistes préférés — inspiré de Letterboxd, mais pour la musique. Sans pub, sans abonnement.

## [→ discheck.dmdlab.app](https://discheck.dmdlab.app)

[Voir la roadmap →](ROADMAP.md)

## Pourquoi cette app

Discheck est née d'un besoin simple : garder une trace de son parcours musical artiste par artiste. La discographie complète s'affiche (albums, EPs, singles), on coche ce qu'on a écouté, on note chaque titre. Le dashboard analyse les habitudes d'écoute : classements, genres, décennies, profondeur d'exploration. Pas de streaming, pas de recommandations algorithmiques — juste sa bibliothèque, ses écoutes, ses notes.

## Stack

Next.js · Tailwind CSS v4 · Supabase (PostgreSQL) · Deezer API · MusicBrainz API · Lucide React

## Couleurs

Primaire vert `#22c55e`

## Fonctionnalités

### Recherche & Discographie
- Recherche d'artiste en temps réel (Deezer API, debounce 350ms)
- Discographie complète triée par date décroissante — albums, EPs, singles
- Filtres par type de sortie (Tout / Albums / EP / Singles)
- Barre de recherche dans la discographie par titre de sortie (desktop inline, mobile via icône)
- Timeline par année avec indicateurs de progression
- Panel slide-in pour explorer les titres d'une sortie
- Cocher un titre comme écouté (ou tout cocher d'un coup)
- Notation par titre de 1 à 5 avec couleurs sémantiques
- Note d'album = moyenne automatique des titres notés
- Barre de progression par sortie dans la discographie
- Page "Mes artistes" avec progression globale par artiste

### Dashboard — Onglet Accueil
- Bannière avec stats globales (artistes, albums, tracks, note moyenne)
- Classement des artistes les mieux notés (min. 5 tracks notées)
- Classement des albums préférés
- Tracks favorites (notées 5/5)
- Activité récente (dernières écoutes)

### Dashboard — Onglet Collection
- Vue globale de la collection avec progression totale
- Exploration par artiste avec niveau de complétion
- Activité récente avec panel "voir plus"
- Collection par décennie et par genre (MusicBrainz)

### Dashboard — Onglet Profil
- Concentration d'écoute, type d'auditeur, profondeur d'exploration
- Genres musicaux (MusicBrainz CC BY 4.0)
- Distribution des notes, écart notes tracks/albums
- Décennies favorites

### Compte & Auth
- Inscription (email + pseudo), connexion, déconnexion
- Mot de passe oublié avec email et page de réinitialisation dédiée
- Thème sombre/clair (dark par défaut)
- Transitions de pages fluides (View Transitions API)

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
