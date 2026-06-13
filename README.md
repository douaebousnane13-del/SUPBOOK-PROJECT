# SupBook

Application de bibliothèque personnelle. L'utilisateur s'inscrit, ajoute ses livres, peut leur attacher un auteur et les ranger dans des collections, mettre une note, un avis et suivre son statut de lecture.

Backend en Strapi v5, frontend en React.

## Schéma relationnel


Un utilisateur peut avoir plusieurs livres, plusieurs auteurs et plusieurs collections.
Chaque livre peut avoir un auteur (optionnel) et appartenir à plusieurs collections.

User → Livre (1-N)
Livre → Auteur (1-1, optionnel)
Livre → Collection (N-N)
User → Auteur (1-N)
User → Collection (1-N)




Modèles :

- - **Livre** : titre, description, couverture (URL), statut (`a_lire` / `en_cours` / `termine`), note (1-5), avis. Relations : `auteur` (oneToOne), `collections` (manyToMany), `users_permissions_user` (manyToOne).

- **Auteur** : nom, prenom. Relation : `users_permissions_user` (manyToOne).
- **Collection** : nom. Relation : `users_permissions_user` (manyToOne).

Chaque ressource est rattachée à son créateur via `users_permissions_user`, ce qui sert au filtrage côté contrôleur.

## Installation backend

Prérequis : Node 20+, npm 9+.


npm install
cp .env.example .env
npm run develop


Strapi écoute sur `http://localhost:1337`. Au premier lancement il faut créer le compte super-admin via `/admin`.

Permissions à activer pour le rôle `Authenticated` (Settings → Users & Permissions → Roles → Authenticated) :

- Livre : find, findOne, create, update, delete
- Auteur : find, findOne, create, update, delete
- Collection : find, findOne, create, update, delete

## Installation frontend


cd supbook-frontend
npm install
npm start


L'app tourne sur `http://localhost:3000`. Le backend Strapi doit être lancé avant.

## Variables d'environnement

Fichier `.env` à la racine du backend (copier `.env.example`) :


HOST=0.0.0.0
PORT=1337
APP_KEYS=...
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
JWT_SECRET=...
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db


Les valeurs `...` sont à remplacer ; Strapi en génère au premier `npm run develop` si elles sont absentes. Ne pas commiter ce fichier.

## Choix techniques


J'ai choisi Strapi v5 parce que la consigne l'imposait, mais aussi parce que je l'avais déjà un peu utilisé. Le fait que les routes REST soient générées automatiquement m'a permis de me concentrer sur ce qui sortait pas de Strapi par défaut : rattacher chaque ressource à son utilisateur, filtrer les données selon l'utilisateur connecté, et gérer proprement la suppression en cascade quand on supprime un auteur.

Pour le front j'ai utilisé React parce que c'est ce que je maîtrise le mieux. J'ai pas utilisé react-router-dom — avec seulement 5 pages, un simple useState dans App.js suffit largement et ça évite d'ajouter une dépendance pour rien. Pareil pour les appels API, j'ai pas pris axios : fetch est déjà disponible dans le navigateur, et j'ai tout centralisé dans un helper request() dans services/api.js pour pas répéter le même try/catch partout.

Le JWT est stocké dans le localStorage parce que c'est ce que Strapi renvoie après la connexion, et ça permet de rester connecté même après un refresh de page.

J'ai utilisé SQLite pour la base de données parce que le projet tourne en local et que ça évitait d'avoir à installer et configurer un serveur Postgres juste pour un rendu.

Pour le style j'ai gardé du CSS inline directement dans les composants. Pour un projet de cette taille ça reste lisible et ça évite de jongler entre les fichiers JS et des fichiers CSS séparés.



## Guide utilisateur

**S'inscrire** : page d'accueil → "S'inscrire", remplir nom / email / mot de passe. Redirection vers la page de connexion.

**Se connecter** : email + mot de passe. Redirection vers la bibliothèque.

**Ajouter un livre** : bouton "+ Ajouter un livre" → modal. Titre obligatoire, le reste est optionnel (description, URL de couverture, statut, note, avis, auteur, collections — on peut en cocher plusieurs).

**Modifier / supprimer** : boutons sur chaque carte. Le modal de modification reprend les mêmes champs.

**Filtres et tri** : barre latérale. Filtre par statut, par auteur, par collection. Tri par titre, par note ou par statut. Recherche par titre dans la barre du haut.

**Auteurs et collections** : pages dédiées accessibles depuis la nav, pour les créer indépendamment des livres et pouvoir ensuite les associer.

**Se déconnecter** : bouton dans la nav. Le token est retiré du `localStorage`.
