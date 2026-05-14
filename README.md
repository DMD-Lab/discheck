# Discheck

Tracker de discographie musicale. Explorez, cochez et notez chaque sortie de vos artistes préférés.

Inspiré de Letterboxd — mais pour la musique.

---

## Ce que c'est

Discheck vous permet de garder une trace de votre parcours musical artiste par artiste. Vous recherchez un artiste, sa discographie complète s'affiche (albums, EPs, singles), et vous cochez les titres que vous avez écoutés. Chaque titre peut être noté de 1 à 5. La note d'un album est calculée automatiquement à partir de la moyenne de ses titres.

Pas de streaming. Pas de recommandations algorithmiques. Juste votre bibliothèque, vos écoutes, vos notes.

---

## Stack

| Élément | Choix |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Auth + BDD | Supabase (PostgreSQL) |
| Music data | Deezer API (lecture sans clé) |
| Hosting | Vercel |
| Icônes | Lucide React |
| Transitions | next-view-transitions |

---

## Fonctionnalités v1

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

---

## Lancer en local

```bash
# Installer les dépendances
npm install

# Variables d'environnement
cp .env.example .env.local
# Renseigner NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY

# Démarrer le serveur de dev
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

---

## Structure

```
src/
├── app/
│   ├── (auth)/           # Login, Register
│   ├── (main)/
│   │   ├── artist/[id]/  # Discographie d'un artiste
│   │   ├── artists/      # Liste des artistes suivis
│   │   ├── search/       # Recherche
│   │   └── settings/     # Préférences
│   └── api/
│       └── deezer/       # Proxy routes vers l'API Deezer
├── components/
│   ├── artist/           # ReleaseRow
│   ├── layout/           # Sidebar, DetailPanel
│   ├── track/            # TrackRow
│   └── ui/               # StatCard
└── lib/
    ├── deezer/            # Types + fetch helpers
    └── supabase/          # Client browser + server
```

---

## Schéma BDD (Supabase)

```sql
profiles          -- pseudo + uuid lié à auth.users
cached_artists    -- cache métadonnées artiste (TTL 7j)
cached_albums     -- cache albums/singles/EPs (TTL 24h)
cached_tracks     -- cache titres (TTL 7j)
listened_tracks   -- (user_id, track_deezer_id) — écoutes
track_ratings     -- (user_id, track_deezer_id, rating 1-5) — notes
```

---

## Roadmap

### v1.0 — Tracker de base ✅
- Recherche, discographie, cocher/noter, progression, compte utilisateur

### v2.0 — Stats & Feed
- Page Stats : titres écoutés, albums complétés, artistes suivis, distribution des notes
- Feed "Nouveautés" : nouvelles sorties des artistes suivis, triées par date
- Badge "New" sur un artiste si nouvelle sortie depuis la dernière visite
- Filtres avancés dans la discographie (par décennie, par note minimale)
- Import Last.fm : historique d'écoutes converti en écoutes Discheck
- Déconnexion + suppression de compte depuis les paramètres

### v3.0 — Social & Découverte
- Profils publics et partage de discographie
- Comparaison de progression avec d'autres utilisateurs
- Recommandations basées sur les notes (artistes similaires bien notés)
- Extraits audio 30s via Deezer preview (lecture sans quitter l'app)
- Export de ses données (CSV / JSON)
- Application mobile (iOS / Android)

---

## DMD Lab

Discheck est une app [DMD Lab](https://github.com/DMD-Lab) — moderne, épurée, sans pub, sans abonnement.
