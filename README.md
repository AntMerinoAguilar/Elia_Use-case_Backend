# 🚀 eDuty - Gestion des Échanges et Remplacements de Shifts

## 📌 Introduction

**eDuty** est une application permettant aux agents de **gérer leurs shifts**, **échanger leurs horaires** et **trouver des remplaçants en cas d'absence**.  
L'API offre plusieurs fonctionnalités comme :

- Création et gestion des shifts par les agents
- Demande et acceptation de swaps et remplacements
- Système de notifications
- Suivi des historiques des échanges

## 💻 Déploiement

L'API est déployée à l'adresse suivante :

**URL de base** : `https://eduty-groupe2.onrender.com/`

Toutes les requêtes doivent être envoyées avec cette URL comme préfixe.

---

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
- **GET** `/api/requests/:id`→ Récupérer une demande par ID
- **POST** `/api/requests`→ Créer une demande de remplacement ou d'échange
- **PUT** `/api/requests/:id/accept`→ Accepter une demande
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

#### `POST /api/requests/:id/accept`

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

🌟 **eDuty - Un système simple et efficace pour gérer vos shifts !** 🚀  
📧 **Contactez-nous pour toute question ou amélioration !**

//////////////////////////////////////////////////////////////////////////////////////////////////////

# eDuty - Gestion des Shifts et Remplacements

Bienvenue dans le projet **eDuty**, une application permettant aux agents de gérer leurs shifts, demander des remplacements et effectuer des échanges de services.

## 🔧 Installation

1. Clonez le dépôt :
   ```sh
   git clone https://github.com/votre-repo/eDuty.git
   cd eDuty
   ```
2. Installez les dépendances du backend et du frontend :
   ```sh
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Configurez les variables d'environnement (`.env`) pour le backend :
   ```sh
   MONGO_URI=your_mongo_uri
   JWT_SECRET=your_jwt_secret
   ```
4. Démarrez le serveur backend :
   ```sh
   npm start
   ```
5. Démarrez le serveur frontend :
   ```sh
   npm run dev
   ```

## 🌍 Déploiement

L'API est déployée sur **Render** : [https://eduty-groupe2.onrender.com](https://eduty-groupe2.onrender.com)

## 📌 API Documentation

L'API est organisée autour de plusieurs endpoints permettant la gestion des agents, des shifts, des demandes et des notifications.

### 🔑 Authentification

#### `POST /api/auth/login`

- **Description** : Connexion d'un agent.
- **Corps de requête** :
  ```json
  {
    "username": "agent1",
    "password": "password"
  }
  ```
- **Réponse** :
  ```json
  {
    "token": "jwt_token",
    "agent": { "_id": "xxx", "name": "John", "surname": "Doe" }
  }
  ```

#### `POST /api/auth/logout`

- **Description** : Déconnexion de l'agent.

### 👥 Agents

#### `GET /api/agents/me`

- **Description** : Récupère les informations de l'agent connecté.

#### `GET /api/agents`

- **Description** : Liste de tous les agents.

### ⏳ Shifts

#### `GET /api/shifts`

- **Description** : Récupère tous les shifts.

#### `GET /api/shifts/:id`

- **Description** : Récupère un shift spécifique.

### 📌 Demandes de remplacement / échange

#### `POST /api/requests`

- **Description** : Crée une demande de remplacement ou de swap.
- **Types de demandes** :
  - **Replacement** : Un agent demande un remplacement sans proposer de créneau de disponibilité (`availableSlots` non requis).
  - **Swap** : Un agent propose un échange avec un autre créneau (`availableSlots` requis).
  - **Urgent Replacement** : Un agent annule immédiatement une partie de son shift et le rend disponible pour les autres.
- **Exemple de requête** :
  ```json
  {
    "requesterId": "agent123",
    "shiftId": "shift456",
    "timeSlot": {
      "startTime": "2025-02-20T08:00:00.000Z",
      "endTime": "2025-02-20T12:00:00.000Z"
    },
    "requestType": "Swap",
    "availableSlots": [
      {
        "startTime": "2025-02-21T10:00:00.000Z",
        "endTime": "2025-02-21T14:00:00.000Z"
      }
    ],
    "targetAgentId": "agent456"
  }
  ```

#### `POST /api/requests/:id/accept`

- **Description** : Accepte une demande de remplacement ou d'échange.
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
  - Si **Urgent Replacement**, le shift est immédiatement rendu disponible pour d'autres agents.

### 🔔 Notifications

#### `GET /api/notif/:agentId`

- **Description** : Récupère les notifications d'un agent.

#### `PUT /api/notif/:id/read`

- **Description** : Marque une notification comme lue.

### 📜 Historique

#### `GET /api/history/:id`

- **Description** : Récupère l'historique des demandes liées à un agent.

## 🚀 Contribution

Les contributions sont les bienvenues !

1. Forkez le repo
2. Créez une branche (`feature/ma-fonctionnalité`)
3. Committez vos changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`)
4. Poussez votre branche (`git push origin feature/ma-fonctionnalité`)
5. Ouvrez une Pull Request

## 📜 Licence

Projet sous licence MIT. Vous êtes libre de l'utiliser et de le modifier.

---

🔗 **eDuty** - Un projet pour une meilleure gestion des shifts et des remplacements.
