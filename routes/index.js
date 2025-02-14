// Ce fichier va centraliser l'importation des différentes routes.
// Chaque membre de l'équipe ajoutera ses fichiers de routes dans ce dossier et les exportera ici.

const express = require("express");
const router = express.Router();

// Importer les sous-routes
const shiftsRoutes = require('./shiftsRoutes');
const requestsRoutes = require('./requestsRoutes');
const agentsRoutes = require("./agentsRoutes");
const authenticationsRoutes = require("./authenticationsRoutes");
const notificationsRoute = require('./notificationsRoutes')
const historyRoutes = require('./historyRoutes')

// Définir les préfixes pour chaque groupe de routes
const basePath = {
    agents: "/agents",
    shifts: '/shifts',
    authentications: "/auth",
    requests: '/requests',
    notifications: '/notif',
    history:'/history'
};

router.use(basePath.agents, agentsRoutes);
router.use(basePath.shifts, shiftsRoutes);
router.use(basePath.requests, requestsRoutes);
router.use(basePath.authentications, authenticationsRoutes);
router.use(basePath.notifications, notificationsRoute);
router.use(basePath.history, historyRoutes);


module.exports = router;