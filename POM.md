# POM - Plan d'Opération du Projet

## 1. Objectif
Ce document sert de guide de démarrage local pour l’application de connexion + formulaire.

## 2. Informations importantes

### Identifiants de démonstration
- username: admin
- password: admin123

### URLs locales
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### JWT
Le backend génère un token JWT après un login réussi.
Les routes protégées attendent le header suivant :

```http
Authorization: Bearer <jwt_token>
```

## 3. Pré-requis
- Node.js installé
- npm installé
- terminal PowerShell ou bash
- Postman ou Bruno optionnel

## 4. Démarrage du projet

### Backend
```bash
cd "c:\Users\houss\Alya's app\backend"
npm install
node server.js
```

### Frontend
```bash
cd "c:\Users\houss\Alya's app\frontend"
npm install
npm run dev
```

## 5. Vérification du backend
```bash
curl http://localhost:3001/api/health
```

Réponse attendue :
```json
{"status":"ok","message":"API backend opérationnelle"}
```

## 6. Vérification du frontend
Ouvrir dans le navigateur :
http://localhost:5173

## 7. Flux utilisateur de base
1. Ouvrir le frontend
2. Se connecter avec admin / admin123
3. Remplir le formulaire
4. Valider la modale de confirmation
5. Vérifier la page de confirmation
6. Vérifier que la dernière soumission est bien récupérée

## 8. Tests manuels API

### Login
- Méthode: POST
- URL: http://localhost:3001/api/login
- Body JSON:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Soumission du formulaire
- Méthode: POST
- URL: http://localhost:3001/api/forms
- Header:
```http
Authorization: Bearer <jwt_token>
```
- Body JSON:
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
  "comments": "Essai"
}
```

### Dernière soumission
- Méthode: GET
- URL: http://localhost:3001/api/forms/latest
- Header:
```http
Authorization: Bearer <jwt_token>
```

## 9. Fichiers importants
- backend/server.js
- backend/app.db
- frontend/src/pages/LoginPage.jsx
- frontend/src/pages/FormPage.jsx
- frontend/src/pages/ConfirmationPage.jsx
- README.md
- PROMPT.md

## 10. Remarques
- La base SQLite est locale et persistante.
- La version actuelle est une démo locale interne.
- Les tests automatiques ne sont pas inclus dans cette version.
