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

## v1.2 ✅

### Recherche & Discographie
- Pagination complète de la discographie (tous les albums récupérés, pas seulement les 100 premiers)
- Correction de la déduplication par titre (suppression du filtre qui masquait des albums légitimes)

### Lecture & Notation
- Écoute d'un extrait 30s par titre (Deezer preview)

### Dashboard
- Tooltips d'aide sur toutes les sections du dashboard (Collection, Profil)
- Correction de la section Concentration d'écoute (seuil minimum 4 artistes)
- Correction de la card "Autres genres" (masquée si aucun genre supplémentaire)
- Correction de la hauteur des sections Collection (hauteur uniforme entre sections)
- Correction des écarts de notes avec des tracks sans notation

### App & Technique
- Correction du calendrier de date d'écoute sur Brave/Chromium (navigation entre mois)

---

## v1.3 ✅

### Recherche & Discographie
- Barre de recherche dans la discographie par titre de sortie (desktop inline, mobile via icône)
- Pagination Deezer complète (boucle sur le champ `next` pour dépasser la limite des 100 premiers résultats)
- Correction de la déduplication (clé `record_type + titre` — évite la fusion entre un album et un single homonymes)
- Correction des incohérences de comptage (barre de recherche et page "Mes artistes" affichent désormais le nombre réel depuis le cache, non le `nb_album` brut Deezer)

### Dashboard
- Correction du crash "Top albums" (panel "voir plus") quand la note d'album est nulle

---

## v1.4 ✅

### Mes artistes
- Artistes triés par date de dernière écoute (le plus récent en premier)

### Recherche & Discographie
- Badge coloré sur la note d'une sortie (couleur sémantique selon la valeur)
- Skeleton sur les pochettes d'albums pendant le chargement
- Image de l'artiste chargée en priorité (preload LCP)

### Lecture & Notation
- Raccourci "date de sortie" dans le calendrier d'écoute (icône CalendarClock)
- Correction des couleurs de notes (4 → lime, 5 → vert vif)

### Dashboard
- Activité récente limitée aux 100 dernières tracks et albums
- Correction du gradient MarqueeText dans les panels (Profondeur, Écart, Activité récente)
- Correction de l'espacement "Top Artistes" avec peu d'artistes (badge "1" collé au séparateur)
- Correction de la hauteur "Collection globale" quand le delta de période est indisponible
- Mise à jour des tooltips et libellés des panels d'activité

---

## v1.5 ✅

### Mes artistes
- Tri alphabétique (remplace le tri par dernière écoute, plus stable et prévisible)
- Plafond de favoris augmenté de 5 à 10 artistes
- Correction du scroll de la sidebar (n'apparaît que si la liste dépasse réellement l'espace disponible)

### Recherche & Discographie
- Correction du pourcentage de progression : une sortie commencée compte désormais dans le calcul (plancher à 1%), même logique entre "Mes artistes" et la discographie
- Widget "tracks écoutés" à la place de "en cours" sur la page discographie
- Skeleton de chargement dans le panel de détail d'une sortie (stats + liste des titres)
- Chargement des pochettes optimisé (variante d'image plus légère + cache serveur allongé), pour limiter l'effet de "vague" sur les grosses discographies

### Lecture & Notation
- Date d'écoute d'un single éditable depuis le widget, liée directement au track principal (fini les incohérences entre le widget et la ligne du titre)

### Dashboard
- Correction des heures d'écoute bloquées à 0 sur Accueil et Collection (calcul basé sur la durée réelle des titres)

---

## v1.6 ✅

### Partage
- Génération d'une image partageable pour une sortie (pochette, note, titres) depuis le panel de détail
- Trois modes : note seule, titres favoris (jusqu'à 5, ordre libre), ou liste complète des titres notés
- Partage natif (Web Share API) ou téléchargement de l'image
- Disponible uniquement pour une sortie entièrement écoutée et notée (note du titre principal pour un single)

---

## v1.7 ✅

### Dashboard
- Migration des stats des onglets Accueil, Profil et Collection vers des fonctions Postgres (RPC), pour lever le plafond de 1000 lignes qui faussait silencieusement les chiffres des comptes avec beaucoup de données
- Correction du classement "Top albums" qui pouvait inclure des sorties sans note attribuée
- Correction du delta "Autres" (Collection par genre) qui pouvait compter des écoutes à genre non résolu

---

## v1.8 ✅

### Recherche & Discographie
- Résultats de recherche triés par nombre de fans, pour faire remonter les artistes populaires sur une requête partielle
- Refonte de la page de recherche : barre de recherche fixe, conteneur de résultats à hauteur dynamique avec défilement interne
- Refonte du header de la page artiste : nom qui ne déborde plus pour les artistes à nom long, widgets de stats homogènes et plus discrets (icône toujours à distance fixe du texte)
- Correction de l'alignement de l'année sur la frise chronologique (décalage avec le repère visuel)
- Skeleton de la page artiste remis en cohérence avec la nouvelle disposition du header et des widgets

### Lecture & Notation
- Note d'un single modifiable directement depuis son widget dédié, comme pour un album ou un EP
- Possibilité de retirer une note (titre, album, EP ou single) en cas d'erreur
- Correction de l'alignement des widgets d'une sortie sur mobile 375px (icône/texte empilés au lieu d'être collés à gauche)

### Divers
- Correction d'un bug d'attribution d'année (MusicBrainz) qui pouvait assigner la mauvaise année à des sorties au titre écrit en caractères non-latins (chinois, coréen…)

---

## v1.8.1 ✅

### Recherche & Discographie
- Filtrage des sorties pas encore officiellement disponibles (albums en pré-sortie chez Deezer, pochette et tracklist incomplètes) — n'apparaissent qu'à leur date de sortie réelle

### App & Technique
- Correction d'un bug de troncature sur la page artiste (plafond de 1000 lignes Supabase) qui pouvait afficher une note sans coche "écouté" sur les comptes avec beaucoup d'historique
- Plafond de 100 entrées sur les classements "voir plus" (Top Albums, Top Artistes, Tracks Favorites), pour prévenir la même classe de bug à l'avenir

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
