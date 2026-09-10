# Alya Local App

Application locale de connexion et de formulaire avec frontend React, backend Express et base SQLite.

## 1. Vue d’ensemble

Cette app permet de :
- se connecter avec un utilisateur et un mot de passe
- remplir un formulaire avec différents types de champs
- soumettre le formulaire vers un backend local
- enregistrer les données dans une base SQLite locale
- afficher une page de confirmation qui récupère la dernière soumission

## 2. Stack technique

- Frontend : React + Vite
- Backend : Node.js + Express
- Base de données : SQLite3
- Authentification : JWT
- Port frontend : 5173
- Port backend : 3001

## 3. Identifiants de connexion

Utilisateur de démonstration :
- username: admin
- password: admin123

## 4. Prérequis

Avant de lancer l’application, il faut avoir installé :
- Node.js (version récente)
- npm
- un navigateur moderne
- un outil HTTP comme Postman ou Bruno (optionnel)

## 5. Démarrage du backend

Depuis le dossier backend :

```bash
cd "c:\Users\houss\Alya's app\backend"
npm install
node server.js
```

Le serveur démarre sur :
- http://localhost:3001

Vérification rapide :

```bash
curl http://localhost:3001/api/health
```

Réponse attendue :

```json
{"status":"ok","message":"API backend opérationnelle"}
```

## 6. Démarrage du frontend

Depuis le dossier frontend :

```bash
cd "c:\Users\houss\Alya's app\frontend"
npm install
npm run dev
```

Le frontend est accessible sur :
- http://localhost:5173

## 7. Utilisation dans le navigateur

1. Ouvrir http://localhost:5173
2. Se connecter avec :
   - username: admin
   - password: admin123
3. Remplir le formulaire
4. Cliquer sur le bouton de soumission
5. Confirmer la modale
6. La page de confirmation affiche les informations enregistrées

## 8. Appels API backend

### 8.1. Login

Endpoint :
- POST http://localhost:3001/api/login

Corps JSON :

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Réponse attendue :

```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": "admin",
  "token": "<jwt_token>"
}
```

### 8.2. Vérification de session

Endpoint :
- GET http://localhost:3001/api/me

Header requis :

```http
Authorization: Bearer <jwt_token>
```

### 8.3. Soumission du formulaire

Endpoint :
- POST http://localhost:3001/api/forms

Header requis :

```http
Authorization: Bearer <jwt_token>
```

Corps JSON exemple :

```json
{
  "firstName": "Alice",
  "lastName": "Martin",
  "email": "alice@example.com",
  "department": "IT",
  "experience": "Intermédiaire",
  "role": "Développeur",
  "interests": ["Technologie", "Formation"],
  "newsletter": true,
  "comments": "Demande de validation"
}
```

Réponse attendue :

```json
{
  "success": true,
  "message": "Formulaire enregistré avec succès.",
  "id": 1,
  "submittedAt": "2026-09-07T12:00:00.000Z"
}
```

### 8.4. Récupération de la dernière soumission

Endpoint :
- GET http://localhost:3001/api/forms/latest

Header requis :

```http
Authorization: Bearer <jwt_token>
```

Réponse attendue :

```json
{
  "success": true,
  "submission": {
    "id": 1,
    "first_name": "Alice",
    "last_name": "Martin",
    "email": "alice@example.com",
    "department": "IT",
    "experience": "Intermédiaire",
    "role": "Développeur",
    "interests": ["Technologie", "Formation"],
    "newsletter": true,
    "comments": "Demande de validation",
    "submitted_at": "2026-09-07T12:00:00.000Z"
  }
}
```

## 9. Utilisation avec Postman ou Bruno

### Étape 1 : se connecter
1. Ouvrir Postman ou Bruno
2. Créer une requête de type POST
3. URL : http://localhost:3001/api/login
4. Headers :
   - Content-Type: application/json
5. Body :

```json
{
  "username": "admin",
  "password": "admin123"
}
```

6. Envoyer la requête
7. Copier la valeur du champ token de la réponse

### Étape 2 : utiliser le token sur les routes protégées
Ajouter un header :

```http
Authorization: Bearer <jwt_token>
```

### Étape 3 : soumettre le formulaire
- Méthode : POST
- URL : http://localhost:3001/api/forms
- Headers :
  - Content-Type: application/json
  - Authorization: Bearer <jwt_token>
- Body :

```json
{
  "firstName": "Alice",
  "lastName": "Martin",
  "email": "alice@example.com",
  "department": "IT",
  "experience": "Intermédiaire",
  "role": "Développeur",
  "interests": ["Technologie", "Formation"],
  "newsletter": true,
  "comments": "Test via Postman"
}
```

### Étape 4 : récupérer la dernière soumission
- Méthode : GET
- URL : http://localhost:3001/api/forms/latest
- Header :
  - Authorization: Bearer <jwt_token>

## 10. Fichiers importants

- backend/server.js : serveur Express et logique backend
- backend/app.db : base SQLite locale
- frontend/src/pages/LoginPage.jsx : page de connexion
- frontend/src/pages/FormPage.jsx : formulaire de soumission
- frontend/src/pages/ConfirmationPage.jsx : page de confirmation
- frontend/src/api.js : appels API frontend
- PROMPT.md : documentation technique du projet

## 11. Points de sécurité importants

- Le JWT est utilisé pour sécuriser les routes protégées.
- Le token est stocké côté frontend dans le localStorage pour la démo locale.
- La validation backend est obligatoire avant insertion en base.
- Les mots de passe sont gérés en mode démonstration localement ; ce n’est pas une authentification de production.

## 12. POM (pour lancer le projet localement)

Voici le petit plan d’exécution local (POM) :

1. Installer les dépendances backend
2. Démarrer le backend : node server.js
3. Installer les dépendances frontend
4. Démarrer le frontend : npm run dev
5. Ouvrir http://localhost:5173
6. Se connecter avec admin / admin123
7. Remplir le formulaire et soumettre
8. Vérifier la page de confirmation
9. Optionnel : tester les endpoints via Postman / Bruno

## 13. Remarques supplémentaires

- La version actuelle ne contient pas de tests automatisés.
- Les données sont stockées localement dans SQLite.
- Le projet est pensé pour un environnement local de démonstration et de développement.
