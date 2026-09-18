# Prompt de développement de l'application locale

## 1. Objectif fonctionnel
Créer une application web locale permettant à un utilisateur de se connecter avec un nom d'utilisateur et un mot de passe, de remplir un formulaire complet, puis de soumettre les informations à une API backend qui les enregistre dans une base SQLite locale. Une fois la soumission validée, l'utilisateur est redirigé vers une page de confirmation qui affiche un message de succès et récupère les dernières informations enregistrées via un appel GET.

## 2. Flux complet attendu
1. L'utilisateur ouvre le frontend local.
2. Il se connecte avec les identifiants suivants :
   - username: admin
   - password: admin123
3. Le backend vérifie les identifiants et renvoie un JWT valide.
4. Le frontend stocke le token dans le localStorage.
5. Le formulaire s'ouvre uniquement si le token est présent et valide.
6. Le formulaire contient :
   - champs texte
   - listes déroulantes
   - boutons radios
   - cases à cocher / checklist
   - case de newsletter
   - bouton de soumission
7. Avant envoi, le frontend valide les champs avec des règles métiers.
8. Lors de la soumission, le frontend envoie une requête POST vers le backend avec le token JWT dans l'en-tête Authorization.
9. Le backend valide le payload, enregistre la donnée dans SQLite, puis répond avec un message de succès.
10. L'utilisateur est redirigé vers la page de confirmation.
11. La page de confirmation appelle un GET protégé pour récupérer la dernière soumission enregistrée.
12. Le frontend affiche le message de confirmation ainsi que les détails de la soumission.

## 3. Détails techniques

### Frontend
- Technologie : React + Vite
- Langage : JavaScript
- Routage : react-router-dom
- Style : CSS personnalisé
- Port local : 5173
- Authentification : JWT stocké dans le localStorage
- UX : toast de notifications + modale de confirmation avant envoi

### Backend
- Technologie : Node.js + Express
- Base de données : SQLite3
- Port local : 3001
- Sécurité : authentification via JWT (Bearer token)
- Validation : contrôles côté backend sur email, champs obligatoires, longueur et valeurs autorisées

### Endpoints principaux
- GET /api/health
- POST /api/login
- GET /api/me
- POST /api/forms
- GET /api/forms/latest

### Authentification attendue
- identifiant par défaut : admin
- mot de passe par défaut : admin123
- Header attendu pour les routes protégées :
  Authorization: Bearer <token>

### Base de données locale
- Fichier : backend/app.db
- Table : form_submissions
- Champs principaux :
  - id
  - first_name
  - last_name
  - email
  - department
  - experience
  - role
  - interests
  - newsletter
  - comments
  - submitted_at

## 4. Règles fonctionnelles importantes
- L’accès à /form et /confirmation doit être interdit sans token valide.
- La soumission doit échouer proprement si le payload est invalide.
- Le backend ne doit pas accepter des valeurs inattendues pour les enums de département, expérience, rôle ou centres d’intérêt.
- Les messages de validation doivent rester explicites pour l’utilisateur.
- L’application doit être totalement locale, sans dépendance à un service externe.
- La base doit persister localement sur le disque même entre redémarrages du backend.

## 5. Critères d’acceptation
- Le login fonctionne avec les identifiants par défaut.
- Le frontend affiche une erreur claire si le login est invalide.
- Un token JWT est renvoyé après connexion.
- Les routes protégées refusent les accès sans token.
- Le formulaire accepte les inputs, dropdowns, radios, checklists et case à cocher.
- La validation désactive ou bloque les soumissions invalides.
- La soumission enregistre les données dans SQLite.
- La page de confirmation affiche les informations de la dernière soumission.
- L’UX contient des toasts et une modale de confirmation.

## 6. Comment améliorer ce prompt
Pour renforcer la qualité de ce prompt pour un futur agent ou développeur, on peut ajouter :
- les identifiants exacts de l’application
- les ports d’exécution et les URLs locales
- les chemins exacts des fichiers et des modules
- la liste des endpoints avec méthodes, paramètres et exemples JSON
- les règles de validation métier détaillées
- la stratégie de sécurité JWT et session
- les instructions de démarrage local
- les besoins d’accessibilité et de responsive design
- la gestion des erreurs côté backend et frontend
- l’absence de tests automatisés dans la version actuelle

## 7. Exemple de prompt amélioré pour reproduction
"Crée une application web locale en React + Node.js + Express + SQLite. Le frontend doit se connecter sur http://localhost:5173 et le backend sur http://localhost:3001. L’utilisateur se connecte avec admin / admin123. Après connexion, le backend renvoie un JWT. Le frontend stocke le token dans le localStorage et protège les routes /form et /confirmation. Le formulaire contient des inputs, des listes déroulantes, des boutons radios, des checklists et une case à cocher. Les données sont validées côté backend avant insertion dans une table SQLite nommée form_submissions. Une fois validée, la soumission est enregistrée, puis l’utilisateur est redirigé vers une page de confirmation qui appelle GET /api/forms/latest avec le token JWT pour afficher la dernière soumission. Ajoute des toasts pour les messages de succès/erreur et une modale de confirmation avant soumission. Le projet doit fonctionner en local, sans dépendance cloud, et ne doit pas inclure de tests automatisés dans cette version."

## 8. Automatisation frontend

Le projet contient un module dédié dans `frontend test` pour automatiser le parcours navigateur avec :
- Robot Framework
- Browser Library basée sur Playwright
- Python
- Page Object Model avec fichiers `.resource`
- DataDriver et données CSV
- Variables d’environnement pour les URLs et identifiants
- Rapports HTML/XML natifs Robot Framework
- Pabot pour l’exécution parallèle
- GitHub Actions pour la CI/CD

Les instructions détaillées sont disponibles dans `frontend test/README.md` et `frontend test/PROMPT_FRONTEND_TEST.md`.
