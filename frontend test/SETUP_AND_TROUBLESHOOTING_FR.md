# Guide d'installation et de dépannage de l'automatisation frontend

Ce document explique la création du projet d'automatisation frontend Alya, la raison de chaque choix technique, les commandes d'installation et les problèmes rencontrés avec leurs corrections.

Le guide anglais reste disponible dans [SETUP_AND_TROUBLESHOOTING.md](SETUP_AND_TROUBLESHOOTING.md).

## 1. Objectif du projet

L'objectif est d'automatiser le frontend React d'Alya avec Robot Framework et Playwright via Browser Library.

Les scénarios couvrent :

1. La connexion avec des identifiants valides.
2. La gestion d'identifiants invalides.
3. L'accès à la page protégée du formulaire.
4. Le remplissage du formulaire avec des données externes.
5. Les champs texte, listes déroulantes, boutons radio et cases à cocher.
6. La confirmation de la modale avant soumission.
7. La vérification de la page de confirmation.
8. L'exécution headless et headed.
9. L'exécution avec Chrome et Edge.
10. L'exécution parallèle avec Pabot.
11. L'exécution locale et dans GitHub Actions.
 12. Une suite d'exécution légère contenant uniquement l'instruction d'exécution ; garder la logique d'exécution dans les classes Python et la logique UI/métier dans les Page Objects et les suites enfants.

Le projet est séparé du code applicatif et se trouve dans `frontend test`.

## 2. Technologies utilisées

### Robot Framework

Robot Framework est utilisé pour écrire et exécuter les tests.

Pourquoi :

- Les scénarios sont lisibles.
- Les mots-clés évitent la duplication.
- Des rapports HTML et XML sont générés nativement.
- L'intégration avec Browser Library, DataDriver et Pabot est directe.

### Browser Library et Playwright

Browser Library fournit des mots-clés Robot Framework basés sur Playwright.

Pourquoi :

- Playwright automatise les navigateurs modernes.
- Les attentes conditionnelles sont intégrées.
- Chrome, Edge, Chromium, Firefox et WebKit peuvent être utilisés selon la configuration.
- Les logs et artefacts navigateur peuvent être produits en cas d'échec.

### Python

Python exécute Robot Framework et ses bibliothèques complémentaires.

### Page Object Model

Les sélecteurs et les actions d'interface sont séparés des scénarios de test.

Pourquoi :

- Les changements de sélecteurs restent localisés dans les Page Objects.
- Les scénarios décrivent le comportement métier.
- Les actions répétées comme la connexion sont réutilisables.

### Tests data-driven

DataDriver lit les données du formulaire depuis `data/form_cases.csv`.

Pourquoi :

- Ajouter un cas signifie ajouter une ligne CSV.
- Les valeurs ne sont pas dupliquées dans les tests.
- Le même parcours est réutilisable avec plusieurs jeux de données.

### CI/CD

GitHub Actions installe les dépendances, démarre les applications, attend leur disponibilité, exécute les tests et archive les rapports.

Pourquoi :

- Les tests peuvent s'exécuter sur chaque push et pull request.
- Les rapports restent disponibles après un échec.
- L'environnement CI reproduit le parcours local.

## 3. Structure créée

```text
frontend test/
  README.md
  PROMPT_FRONTEND_TEST.md
  SETUP_AND_TROUBLESHOOTING.md
  SETUP_AND_TROUBLESHOOTING_FR.md
  requirements.txt
  .env.example
  execution/
    Execution.py
    ExecutionSuite.robot
  run_tests.ps1
  variables/
    variables.py
    env.py
  data/
    form_cases.csv
  resources/
    common.resource
    pages/
      base_page.resource
      login_page.resource
      dashboard_page.resource
      form_page.resource
      confirmation_page.resource
  tests/
    login.robot
    form_submission.robot
```

Fichiers supplémentaires :

```text
.vscode/settings.json
.github/workflows/frontend-tests.yml
```

## 4. Étapes de création

### Étape 1 : analyser l'application

Les pages React, les routes et les contrôles existants ont été inspectés avant l'écriture des tests.

Éléments identifiés :

- Page de connexion : `/`
- Page protégée du formulaire : `/form`
- Page protégée de confirmation : `/confirmation`
- Champ utilisateur : `id=username`
- Champ mot de passe : `id=password`
- Champs formulaire : `firstName`, `lastName`, `email`, `department`, `experience`, `comments`
- Rôles : `name="role"`
- Intérêts : cases à cocher avec une valeur
- Newsletter : `name="newsletter"`
- Modale : `role="dialog"`

Pourquoi :

Les tests doivent utiliser le contrat réel de l'application et non des sélecteurs supposés.

### Étape 2 : ajouter des sélecteurs stables

Les attributs `data-testid` suivants ont été ajoutés :

- `login-submit`
- `login-error`
- `form-submit`
- `confirm-submit`
- `confirmation-success`
- `confirmation-details`
- `logout`

Pourquoi :

Les classes CSS et les textes peuvent changer lors d'une évolution visuelle. Les `data-testid` définissent un contrat stable pour l'automatisation.

### Étape 3 : créer les dépendances Python

Le fichier `requirements.txt` contient :

- `robotframework`
- `robotframework-browser`
- `robotframework-requests`
- `robotframework-datadriver`
- `robotframework-jsonlibrary`
- `robotframework-pabot`
- `pytest`

Pourquoi :

Un fichier de dépendances rend l'installation locale et CI reproductible.

Browser Library utilise la version `20.4.0`, compatible avec Python 3.14 et ses roues natives `grpcio`.

### Étape 4 : créer la configuration d'environnement

Les variables disponibles sont :

- `BASE_URL`
- `API_URL`
- `APP_USERNAME`
- `APP_PASSWORD`
- `BROWSER`
- `BROWSER_CHANNEL`
- `HEADLESS`
- `SLOW_MO`

Pourquoi :

Les URLs, identifiants, navigateur et mode d'exécution doivent être configurables sans modifier les tests.

### Étape 5 : créer le Base Page

`resources/pages/base_page.resource` centralise :

- L'ouverture du navigateur.
- La fermeture du navigateur.
- L'ouverture de l'application.
- L'attente de chargement conditionnelle.
- Les vérifications d'URL.

Pourquoi :

Les Page Objects partagent ces opérations. Leur centralisation évite la duplication.

### Étape 6 : créer le Login Page

`resources/pages/login_page.resource` contient :

- Le remplissage du nom utilisateur et du mot de passe.
- Le clic sur le bouton de connexion.
- La vérification de l'ouverture du formulaire.

Pourquoi :

La connexion est utilisée par plusieurs scénarios et doit être réutilisable.

### Étape 7 : créer le Dashboard Page

`resources/pages/dashboard_page.resource` représente la page protégée du formulaire.

Il contient les actions pour :

- Vérifier la page du formulaire.
- Remplir les champs texte.
- Choisir le département et l'expérience.
- Choisir le rôle.
- Choisir les centres d'intérêt.
- Choisir la newsletter.
- Soumettre le formulaire.
- Confirmer la modale.
- Vérifier l'arrivée sur la confirmation.

Pourquoi :

Le formulaire est le parcours métier principal. Il doit être isolé dans son propre Page Object.

### Étape 8 : créer le Confirmation Page

`resources/pages/confirmation_page.resource` vérifie les données soumises grâce à `data-testid="confirmation-details"` et permet la déconnexion avec `data-testid="logout"`.

Pourquoi :

Les assertions liées à la confirmation doivent rester dans le Page Object de confirmation.

### Étape 9 : créer les données data-driven

`data/form_cases.csv` contient les données du formulaire.

DataDriver exige que la première colonne soit `*** Test Cases ***`, puis que les colonnes correspondent aux arguments du template :

```text
${first_name}
${last_name}
${email}
${department}
${experience}
${role}
${interests}
${newsletter}
${comments}
```

Pourquoi :

Les scénarios peuvent être enrichis sans recopier les étapes Robot Framework.

L'encodage UTF-8 est explicitement configuré pour conserver les valeurs comme `Intermédiaire` et `Développeur`.

### Étape 10 : créer les tests Robot

`tests/login.robot` vérifie :

- La connexion valide.
- Le refus d'une connexion invalide.

`tests/form_submission.robot` vérifie :

1. L'ouverture de l'application.
2. La connexion.
3. Le remplissage avec les données CSV.
4. La confirmation de la modale.
5. L'ouverture de la confirmation.
6. L'affichage des données soumises.

Pourquoi :

Les fichiers de test doivent décrire les scénarios, tandis que les Page Objects contiennent les détails techniques.

### Étape 11 : éviter les attentes fixes

Aucun `Sleep`, `sleep` ou `Start-Sleep` n'est utilisé dans les tests.

Les tests utilisent :

- `Wait For Load State`
- `Wait For Elements State`
- Des éléments de confirmation stables.
- Des assertions d'URL après l'apparition des éléments attendus.

GitHub Actions utilise `wait-on` pour attendre les services.

Pourquoi :

Une attente fixe est soit trop longue, soit trop courte. Les attentes conditionnelles observent l'état réel de l'application.

### Étape 12 : utiliser des locators forts

La priorité des locators est :

1. Les IDs sémantiques existants.
2. Les attributs `data-testid` stables.
3. Les rôles accessibles lorsqu'ils font partie du contrat d'interface.

Les sélecteurs suivants sont évités :

- Sélecteurs positionnels.
- Classes CSS utilisées uniquement pour le style.
- Sélecteurs `body` trop larges.
- Fragments de texte arbitraires.
- Traversées fragiles du DOM.

Pourquoi :

Les locators forts expriment l'intention du test et résistent mieux aux changements de mise en page.

### Étape 13 : ajouter les modes headless et headed

Le script `run_tests.ps1` accepte :

```powershell
.\run_tests.ps1 -Mode headless
.\run_tests.ps1 -Mode headed
.\run_tests.ps1 -Visible
```

Le mode headless est activé par défaut. Le mode headed affiche le navigateur pour observer l'exécution.

### Étape 14 : ajouter Chrome et Edge

Les deux navigateurs Chromium sont sélectionnés avec `BROWSER_CHANNEL` :

```text
BROWSER_CHANNEL=chrome
BROWSER_CHANNEL=msedge
```

Commandes :

```powershell
.\run_tests.ps1 -Browser chrome -Mode headed
.\run_tests.ps1 -Browser edge -Mode headed
```

Pourquoi :

Les mêmes Page Objects et scénarios peuvent être réutilisés sur Chrome et Edge. Seul le canal Playwright change.

Chrome et Edge doivent être installés sur la machine.

### Étape 15 : ajouter l'exécution parallèle

Pabot est installé dans `requirements.txt` et peut exécuter les suites en parallèle :

```powershell
pabot --outputdir reports --processes 2 tests
```

Pourquoi :

L'exécution parallèle réduit le temps de feedback lorsque le nombre de scénarios augmente.

### Étape 16 : ajouter la configuration VS Code

`.vscode/settings.json` contient :

```json
{
  "robot.language-server.python": "python"
}
```

Pourquoi :

Cette configuration indique au langage Robot Framework quel interpréteur Python utiliser.

### Étape 17 : ajouter la CI/CD

`.github/workflows/frontend-tests.yml` :

1. Récupère le dépôt.
2. Installe Python et Node.js.
3. Installe les dépendances backend et frontend.
4. Installe les bibliothèques Robot Framework.
5. Initialise Playwright avec `rfbrowser init`.
6. Démarre le backend et le frontend.
7. Attend les URLs avec `wait-on`.
8. Exécute Pabot en mode headless.
9. Archive les rapports même en cas d'échec.

Pourquoi :

Les tests sont exécutés automatiquement sur les pushes et pull requests.

### Étape 18 : ajouter la classe Execution

`execution/Execution.py` est une bibliothèque Python Robot Framework utilisée par chaque suite.

Son keyword `Before Class` valide le navigateur et le mode, convertit `edge` vers le canal Playwright `msedge`, définit les variables de suite, crée le dossier de rapports, écrit `execution-config.json` et demande une fenêtre maximisée.

Son keyword `After Class` ferme le navigateur restant et écrit `execution-teardown.txt`. Robot Framework génère ensuite les fichiers natifs `report.html`, `log.html` et `output.xml`.

`execution/ExecutionSuite.robot` est volontairement une suite d'entrée légère. Elle ne contient aucune logique navigateur ou métier ; elle appelle seulement `Run Configured Tests`. L'implémentation reste dans `Execution.py`, les Page Objects et les suites enfants de `tests/`.

Les suites enfants peuvent être sélectionnées avec `TEST_SUITES` :

```powershell
$env:TEST_SUITES="tests/login.robot,tests/form_submission.robot"
```

Le rapport parent est écrit dans le dossier choisi et les rapports enfants sont écrits dans `children/`.

## 5. Installation

Depuis le dossier `frontend test` :

```powershell
python --version
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
rfbrowser init
rfbrowser --help
```

Les installations individuelles demandées sont couvertes par `requirements.txt` :

```powershell
pip install robotframework
pip install robotframework-browser
pip install robotframework-requests
pip install robotframework-datadriver
pip install robotframework-jsonlibrary
pip install robotframework-pabot
```

## 6. Exécution locale

Terminal backend :

```powershell
cd "..\backend"
npm install
node server.js
```

Terminal frontend :

```powershell
cd "..\frontend"
npm install
npm run dev
```

Terminal tests :

```powershell
cd "..\frontend test"
.\run_tests.ps1 -Browser chrome -Mode headless
```

Pour voir Chrome :

```powershell
.\run_tests.ps1 -Browser chrome -Mode headed -ReportDirectory reports-chrome-headed
```

Pour voir Edge :

```powershell
.\run_tests.ps1 -Browser edge -Mode headed -ReportDirectory reports-edge-headed
```

## 7. Rapports

Robot Framework génère :

- `report.html` : résumé de l'exécution.
- `log.html` : détail des mots-clés.
- `output.xml` : résultat exploitable par les outils CI.
- `browser/` : artefacts Browser Library éventuels.

Les rapports Chrome et Edge sont stockés dans des dossiers séparés pour éviter qu'une exécution écrase l'autre.

### Fichiers générés

`.env.example` est conservé volontairement comme modèle de configuration sans secret. Il documente les variables disponibles. Le fichier `.env` réel est ignoré par Git et ne doit pas contenir de valeurs sensibles versionnées.

Pabot crée `.pabotsuitenames` pendant la planification d'une exécution parallèle. C'est un index temporaire utilisé par Pabot pour coordonner les workers. Il est ignoré par Git et peut être supprimé ; Pabot le recréera à la prochaine exécution parallèle.

Python peut créer `variables/__pycache__/*.pyc`. Ce sont des fichiers binaires de cache générés automatiquement, pas du code source. Ils sont ignorés par Git et peuvent être supprimés sans risque.

## 8. Problèmes rencontrés et corrections

### Problème 1 : Python absent de la commande PATH

#### Symptôme

`python --version` affichait le message du Microsoft Store.

#### Cause

Windows possédait l'alias `python.exe` du Microsoft Store, mais le véritable interpréteur n'était pas dans PATH.

#### Correction

Le véritable Python a été trouvé dans :

```text
C:\Users\houss\AppData\Local\Programs\Python\Python314\python.exe
```

Le script PowerShell cherche maintenant cette installation et son dossier `Scripts`.

### Problème 2 : incompatibilité grpcio avec Python 3.14

#### Symptôme

L'installation de Browser Library tentait de compiler `grpcio` et échouait pendant la compilation native.

#### Cause

La version initiale de Browser Library dépendait d'une version de grpcio sans roue Windows compatible Python 3.14.

#### Correction

Browser Library a été mise à jour vers `20.4.0`, avec `grpcio 1.83.0` compatible avec Python 3.14.

### Problème 3 : les commandes Robot n'étaient pas reconnues

#### Symptôme

`robot`, `pabot` et `rfbrowser` n'étaient pas trouvés.

#### Cause

Le dossier Python `Scripts` n'était pas dans PATH.

#### Correction

Le script utilise directement les chemins vers `robot.exe`, `pabot.exe` et `rfbrowser.exe`.

### Problème 4 : la politique PowerShell bloquait npm

#### Symptôme

`npm run dev` échouait parce que `npm.ps1` était bloqué.

#### Cause

La politique d'exécution PowerShell locale interdisait les scripts.

#### Correction

La commande suivante a été utilisée :

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

### Problème 5 : DataDriver ne générait pas le test

#### Symptôme

DataDriver affichait :

```text
Unassigned requiered argument detected: ${first_name}
```

#### Cause

Le fichier CSV ne respectait pas la structure attendue. DataDriver exige la colonne `*** Test Cases ***` en première position et des colonnes correspondant exactement aux arguments du template.

#### Correction

Le CSV utilise maintenant :

```text
*** Test Cases ***,${first_name},${last_name},${email},${department},${experience},${role},${interests},${newsletter},${comments}
```

Le fichier Robot utilise un test template sans arguments de test écrits manuellement.

### Problème 6 : caractères accentués corrompus

#### Symptôme

`Intermédiaire` était lu comme `IntermÃ©diaire`.

#### Cause

L'encodage par défaut de DataDriver ne correspondait pas à l'encodage UTF-8 du CSV.

#### Correction

Le DataDriver est configuré avec :

```robot
Library    DataDriver    file=../data/form_cases.csv    dialect=excel    encoding=utf-8
```

### Problème 7 : keyword de synchronisation introuvable

#### Symptôme

Robot ne trouvait pas `Wait For Page To Be Ready`.

#### Cause

Le nom réel du keyword partagé était `Wait Until Page Is Ready`.

#### Correction

Le Login Page a été mis à jour pour appeler le keyword existant.

### Problème 8 : navigation SPA vérifiée trop tôt

#### Symptôme

Le test vérifiait encore `/form` au lieu de `/confirmation`.

#### Cause

React n'avait pas terminé la navigation et le rendu de la page.

#### Correction

Le test attend d'abord l'élément stable `[data-testid="confirmation-success"]`, puis vérifie l'URL.

### Problème 9 : Pabot ne trouvait pas Robot

#### Symptôme

Pabot démarrait les workers, mais ceux-ci ne trouvaient pas la commande `robot`.

#### Cause

Le dossier Scripts Python n'était pas dans PATH pour les sous-processus.

#### Correction

Pabot reçoit le chemin absolu de `robot.exe` avec `--command` et `--end-command`.

### Problème 10 : chemins relatifs incorrects

#### Symptôme

Le script échouait lorsqu'il était lancé depuis la racine du dépôt.

#### Cause

Le dossier courant de l'appelant était utilisé pour résoudre `tests`.

#### Correction

`run_tests.ps1` se positionne maintenant dans `$PSScriptRoot` avant de lancer Robot.

### Problème 11 : locators fragiles

#### Symptôme

Des sélecteurs basés sur du texte ou des classes de style pouvaient casser après un changement visuel.

#### Cause

Ils dépendaient de détails accidentels de l'interface.

#### Correction

Des IDs et `data-testid` stables ont été ajoutés et utilisés dans les Page Objects.

### Problème 12 : attentes fixes

#### Symptôme

Une attente fixe pouvait être trop courte en CI ou inutilement longue en local.

#### Cause

Une durée fixe ne vérifie pas l'état réel de l'application.

#### Correction

Browser Library utilise des attentes conditionnelles et GitHub Actions utilise `wait-on`.

### Problème 13 : nom du canal Edge incorrect

#### Symptôme

Playwright refusait le canal `edge` avec `Unsupported chromium channel "edge"`.

#### Cause

Le nom officiel Playwright du canal Microsoft Edge est `msedge`.

#### Correction

Le script accepte `-Browser edge` et le convertit automatiquement en `BROWSER_CHANNEL=msedge`.

### Problème 14 : navigation login différente entre Chrome et Edge

#### Symptôme

Edge vérifiait parfois l'URL `/` avant l'arrivée sur `/form`, alors que Chrome passait.

#### Cause

Les vitesses de rendu et de navigation SPA différaient entre les navigateurs.

#### Correction

Le Login Page attend d'abord `id=firstName`, puis vérifie l'URL `/form`, sans attente fixe.

## 9. Validation effectuée

Les validations réalisées comprennent :

```text
Chrome headless : 3 tests, 3 réussis, 0 échec
Edge headless : 3 tests, 3 réussis, 0 échec
Chrome headed : 3 tests, 3 réussis, 0 échec
Edge headed : 3 tests, 3 réussis, 0 échec
Exécution Pabot parallèle : 2 suites, 2 réussies, 0 échec
Build frontend React : réussi
```

## 10. Conseils de maintenance

Pour ajouter un nouveau parcours frontend :

1. Inspecter la route et les contrôles accessibles.
2. Ajouter un ID ou un `data-testid` si aucun locator stable n'existe.
3. Ajouter ou modifier un Page Object.
4. Ajouter les données externes si le parcours est data-driven.
5. Utiliser des attentes conditionnelles.
6. Ajouter un scénario Robot ciblé.
7. Exécuter le scénario en headless et headed.
8. Exécuter Chrome et Edge.
9. Tester Pabot si les scénarios peuvent fonctionner en parallèle.
10. Mettre à jour le README et ce guide si l'installation évolue.
