# 🚀 eDuty - Gestion des Échanges et Remplacements de Shifts

## 📌 Introduction

**eDuty** est une application permettant aux agents de **gérer leurs shifts**, **échanger leurs horaires** et **trouver des remplaçants en cas d'absence**.  
L'API offre plusieurs fonctionnalités comme :

- Création et gestion des shifts par les agents
- Demande et acceptation de swaps et remplacements
- Système de notifications
- Suivi des historiques des échanges

## 🚀 Installation & Prérequis

### 📌 Prérequis

Avant de commencer, assure-toi d'avoir installé :

- [Node.js](https://nodejs.org/) (version recommandée : LTS)
- [MongoDB](https://www.mongodb.com/) (localement ou via un service cloud comme MongoDB Atlas)
- Un terminal (Bash, PowerShell, ou un terminal intégré à un IDE comme VS Code)

---

### 🛠️ Étapes d'installation

1️⃣ **Cloner le dépôt**

```bash
git clone https://github.com/AntMerinoAguilar/Elia_Use-case_Backend.git
cd <Elia_Use-case_Backend>
```

2️⃣ **Installer les dépendances**

```bash
npm install
```

3️⃣ **Créer un fichier `.env` à la racine du projet et ajouter les variables d'environnement**

```ini
MONGO_URI=<votre_url_mongodb>
PORT=3000
JWT_SECRET=<votre_secret_jwt>
```

🔹 **MONGO_URI** : URL de connexion à MongoDB (ex : `mongodb://localhost:27017/nom_de_la_bdd`)
🔹 **PORT** : Port sur lequel l'application va tourner (par défaut **3000**)
🔹 **JWT_SECRET** : Clé secrète utilisée pour signer les tokens JWT

4️⃣ **Lancer le serveur**

```bash
npm start
```

ou en mode développement (avec `nodemon` si disponible) :

```bash
npm run dev
```

5️⃣ **Vérifier que le serveur tourne**
Si tout fonctionne correctement, l'API est accessible sur :

```
http://localhost:3000
```

---

## 💻 Déploiement

L'API est déployée à l'adresse suivante :

**URL de base** : `https://eduty-groupe2.onrender.com/`

Toutes les requêtes doivent être envoyées avec cette URL comme préfixe.

---

## 📦 Dépendances

Le projet repose sur plusieurs bibliothèques essentielles pour gérer l'authentification, la communication entre serveurs et la base de données.

### 🔐 Sécurité & Authentification

- **bcryptjs (`^2.4.3`)** : Permet le hachage sécurisé des mots de passe avant leur stockage.
- **jsonwebtoken (`^9.0.2`)** : Gère la création et la vérification des tokens JWT pour l'authentification des utilisateurs.

### 🌐 Middleware & Gestion des requêtes

- **cookie-parser (`^1.4.7`)** : Analyse et gère les cookies envoyés par le client.
- **cors (`^2.8.5`)** : Active le Cross-Origin Resource Sharing pour permettre la communication entre le backend et le frontend.
- **dotenv (`^16.4.7`)** : Charge les variables d'environnement depuis un fichier `.env`, évitant d'exposer des informations sensibles dans le code.
- **express (`^4.21.2`)** : Framework web minimaliste et rapide pour la gestion des routes et des requêtes HTTP.

### 🗄️ Base de données

- **mongoose (`^8.9.6`)** : Facilite l'interaction avec MongoDB via un ORM, permettant de structurer et manipuler les données plus facilement.

---

### 📥 Télécharger et utiliser le workspace Postman

Un workspace Postman préconfiguré est disponible pour faciliter les tests API. Vous pouvez l'importer directement en cliquant sur le lien ci-dessous :

[🚀 Accéder au workspace Postman](https://eliause-casebecode.postman.co/workspace/Elia_Use-case_BeCode-Workspace~39f3ae26-0e1d-4dc8-9c58-aa4477336200/collection/39477284-7d8bc027-e1c0-42a2-81d7-d8241b91ab71?action=share&source=collection_link&creator=39362631)

📌 **Instructions** :

1. Cliquez sur le lien ci-dessus.
2. Connectez-vous ou créez un compte Postman si nécessaire.
3. Cliquez sur **"Fork"** ou **"Import"** pour ajouter la collection à votre propre Postman.
4. Configurez les variables d’environnement avec vos propres valeurs (`MONGO_URI`, `JWT_SECRET`, etc.).
5. Lancez les requêtes pour tester l’API.

---

📌 **Pourquoi utiliser ce workspace ?**  
✅ Contient les principales requêtes API préconfigurées  
✅ Facile à importer dans Postman  
✅ Permet de tester rapidement l’API sans configurer manuellement chaque requête

## 📌 API Documentation

L'API est organisée autour de plusieurs endpoints permettant la gestion des agents, des shifts, des demandes et des notifications.

## 📌 Authentification

Toutes les routes nécessitent une **authentification** avec un **cookie sécurisé** (`token`).  
Assurez-vous d'envoyer `{ withCredentials: true }` dans vos requêtes.

### 🔑 Connexion

**POST** `/api/auth/login`

**Body :**

```json
{
  "username": "HBR",
  "password": "monpassword"
}
```

**Réponse :**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "agent": {
    "_id": "67a230b92010272f88df51d4",
    "name": "Hugo",
    "surname": "Bernard",
    "username": "HBR",
    "code": "HBR",
    "sector": "A1",
    "balance": 0
  }
}
```

---

## 🧑‍💼 Agents

- **GET** `/api/agents/me` → Récupérer les infos de l'agent connecté
- **GET** `/api/agents` → Récupérer la liste des agents
- **GET** `/api/agents/:id` → Récupérer un agent par ID
- **POST** `/api/agents` → Créer un agent
- **PUT** `/api/agents/:id` → Modifier un agent
- **DELETE** `/api/agents/:id` → Supprimer un agent

---

## 🗓️ Shifts

- **GET** `/api/shifts` → Récupérer tous les shifts
- **GET** `/api/shifts/:id` → Récupérer un shift par ID
- **GET** `/api/shifts/me` → Récupérer les shifts de l'agent connecté
- **POST** `/api/shifts` → Créer un shift
- **DELETE** `/api/shifts/:id` → Supprimer un shift

---

## 🔄 3 Types de Demandes (Requests)

- **Replacement** : Un agent cherche un remplaçant pour son shift. Pas de `availableSlots`, le shift est entièrement transféré.
- **Swap** : Un agent propose un échange avec un ou plusieurs créneaux (`availableSlots`). L'agent qui accepte choisit parmi les créneaux proposés.
- **Urgent Replacement** : L'agent libère immédiatement son shift qui devient **disponible pour tous**.

- **GET** `/api/requests`→ Récupérer toutes les demandes
- **GET** `/api/requests/me`→ Récupérer les demandes de l'agent connecté
- **GET** `/api/requests/:id`→ Récupérer une demande par ID
- **POST** `/api/requests`→ Créer une demande de remplacement ou d'échange
- **PUT** `/api/requests/:id/accept`→ Accepter une demande
- **DELETE** `/api/requests/:id/cancel`→ Annuler une demande
- **DELETE** `/api/requests/:id`→ Supprimer une demande

---

### 1. Replacement (Remplacement)

Un agent souhaite **transférer entièrement un shift à un remplaçant**.  
Il n'a pas besoin de proposer un créneau (`availableSlots` absent).

**Exemple de payload :**

```json
{
  "requesterId": "67a230b92010272f88df51d4",
  "shiftId": "67af014e1fcca45693b8a015",
  "timeSlot": {
    "startTime": "2026-01-03T06:30:00.000Z",
    "endTime": "2026-01-03T10:30:00.000Z"
  },
  "requestType": "Replacement"
}
```

---

### 2. Swap (Échange)

L'agent souhaite **échanger un shift avec d'autres agents**.  
Il doit **fournir des créneaux alternatifs** (`availableSlots`).

**Exemple de payload :**

```json
{
  "requesterId": "67a230b92010272f88df51d4",
  "shiftId": "67af014e1fcca45693b8a015",
  "timeSlot": {
    "startTime": "2026-01-03T06:30:00.000Z",
    "endTime": "2026-01-03T10:30:00.000Z"
  },
  "requestType": "Swap",
  "availableSlots": [
    {
      "startTime": "2026-01-05T08:00:00.000Z",
      "endTime": "2026-01-05T12:00:00.000Z"
    }
  ]
}
```

L'agent peut **cibler sa demande de swap** en rajoutant un `targetAgentId`

```json
{
  "requesterId": "67a230b92010272f88df51d4",
  "shiftId": "67af014e1fcca45693b8a015",
  "timeSlot": {
    "startTime": "2026-01-03T06:30:00.000Z",
    "endTime": "2026-01-03T10:30:00.000Z"
  },
  "requestType": "Swap",
  "availableSlots": [
    {
      "startTime": "2026-01-05T08:00:00.000Z",
      "endTime": "2026-01-05T12:00:00.000Z"
    }
  ],
  "targetAgentId": "67a23445543aa5bb5d2fdef3"
}
```

---

### 3. Urgent Replacement (Remplacement Urgent)

L'agent **libère immédiatement un créneau** qui devient **disponible pour tous**.  
L'API **découpe automatiquement le shift** pour rendre la partie demandée disponible.

**Exemple de payload :**

```json
{
  "requesterId": "67a230b92010272f88df51d4",
  "shiftId": "67af014e1fcca45693b8a015",
  "timeSlot": {
    "startTime": "2026-01-03T06:30:00.000Z",
    "endTime": "2026-01-03T10:30:00.000Z"
  },
  "requestType": "Urgent Replacement"
}
```

---

---

### **Accepter une demande** `POST /api/requests/:id/accept`

- **Description** : Accepte une demande de remplacement ou d'échange.
- **ID de la demande**: la requestId doit être inclues dans les params.
- **Corps de requête** :
  ```json
  {
    "agentId": "agent456",
    "selectedSlot": {
      "startTime": "2025-02-20T08:00:00.000Z",
      "endTime": "2025-02-20T12:00:00.000Z"
    }
  }
  ```
- **Comportement** :
  - Si **Replacement**, le shift est transféré à l'agent acceptant.
  - Si **Swap**, les shifts des deux agents sont échangés.

---

## 🔔 Notifications

- **GET** `/api/notif` → Récupérer toutes les notifications
- **GET** `/api/notif/:agentId` → Récupérer les notifications de l'agent
- **POST** `/api/notif` → Créer une notification
- **PUT** `/api/notif/:id/read` → Marquer une notification comme lue
- **DELETE** `/api/notif/:id` → Supprimer une notification

---

## 📝 Historique

- **GET** `/api/history/:` → Récupérer l’historique
- **GET** `/api/history/:id` → Récupérer l’historique d’un agent

---

## 🗺️📈 Roadmap (features à implémenter)

### ✅ Limitation du solde d'heures négatives

- Implémentation d'un plafond empêchant les agents d'accumuler un nombre excessif d'heures en balance négative.
- Mise en place d'un mécanisme d'alerte et de restriction dès que la limite est atteinte.

### 🔄 Système de transaction sécurisé

- Introduction d'un système garantissant que les opérations multi-étapes (ex: acceptation de demande => création de shifts => envoi de notifications etc...) ne soient validées qu'à la complétion de la dernière étape.
- Utilisation d'une approche transactionnelle pour éviter les incohérences dans le workflow et garantir l'intégrité des données.

### 📊 Amélioration du système de balance

- Modification du mécanisme d'incrémentation de la balance afin qu'elle ne soit mise à jour qu'après la prestation effective des heures concernées.
- Implémentation d'une fonction planifiée s'exécutant chaque jour à minuit :
  - Recherche dans l'historique des remplacements les balances ayant une date antérieure ou égale à la date actuelle.
  - Mise à jour automatique de la balance dans le profil de l'agent.
  - Suppression des entrées traitées de l'historique pour éviter l'accumulation de données obsolètes.

---

🌟 **eDuty - Un système simple et efficace pour gérer vos shifts !** 🚀  
📧 **Contactez-nous pour toute question ou amélioration !**
