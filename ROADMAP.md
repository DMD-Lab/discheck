# Discheck — Roadmap

## v1.0 ✅

### Recherche & Discographie
- Recherche d'artiste en temps réel (Deezer API)
- Discographie complète triée par date décroissante — albums, EPs, singles
- Filtres par type de sortie (Tout / Albums / EP / Singles)
- Timeline par année avec indicateurs de progression
- Panel slide-in pour explorer les titres d'une sortie
- Cocher un titre comme écouté (ou tout cocher d'un coup)
- Notation par titre de 1 à 5 avec couleurs sémantiques
- Note d'album = moyenne automatique des titres notés
- Barre de progression par sortie dans la discographie
- Page "Mes artistes" avec progression globale par artiste

### Dashboard — Onglet Accueil
- Bannière de bienvenue avec stats globales (artistes, albums, tracks, note moyenne)
- Classement des artistes les mieux notés (minimum 5 tracks notées)
- Classement des albums préférés
- Tracks favorites (notées 5/5)
- Activité récente (dernières écoutes tracks et albums)

### Dashboard — Onglet Collection
- Vue globale de la collection (progression totale)
- Exploration par artiste avec niveau de complétion
- Activité récente (tracks et albums, avec panel "voir plus")
- Collection par décennie (répartition des écoutes par période)
- Collection par genre (via MusicBrainz)

### Dashboard — Onglet Profil
- Concentration d'écoute (répartition entre artistes)
- Genres musicaux (données MusicBrainz CC BY 4.0)
- Type d'auditeur (profil selon habitudes d'écoute)
- Profondeur d'exploration (% de discographie exploré par artiste)
- Critique (distribution des notes)
- Écart de notes (écart entre note track et note album)
- Décennies favorites

### Compte & Auth
- Inscription (email + pseudo), connexion, déconnexion
- Mot de passe oublié avec email de réinitialisation
- Template email personnalisé (thème dark Discheck)

### App & Technique
- Thème sombre/clair (dark par défaut)
- Transitions de pages fluides (View Transitions API)
- Skeleton loaders sur toutes les pages
- Landing page de présentation
- Page mentions légales (RGPD, attribution Deezer + MusicBrainz)
- Pages 404 et erreur personnalisées
- Paramètres utilisateur (thème, version, mentions DMD Lab)

---

## v2.0 — Idées

- Feed "Nouveautés" : nouvelles sorties des artistes suivis, triées par date
- Badge "New" sur un artiste si nouvelle sortie depuis la dernière visite
- Filtres avancés dans la discographie (par décennie, par note minimale)
- Suppression de compte depuis les paramètres
- Sélecteur de date personnalisé (thème + dark mode)

---

## v3.0 — Vision

- Profils publics et partage de discographie
- Comparaison de progression avec d'autres utilisateurs
- Recommandations basées sur les notes (artistes similaires bien notés)
- Extraits audio 30s via Deezer preview (lecture sans quitter l'app)
- Export de ses données (CSV / JSON)
- Application mobile (iOS / Android)
