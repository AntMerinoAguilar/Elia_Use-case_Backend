// Ce fichier va centraliser l'importation des différentes routes.
// Chaque membre de l'équipe ajoutera ses fichiers de routes dans ce dossier et les exportera ici.

const express = require("express");
const router = express.Router();

// Importer les sous-routes
const shiftsRoutes = require('./shiftsRoutes');
const unavailabilitiesRoutes = require('./unavailabilitiesRoutes');
const requestsRoutes = require('./shiftsRoutes');
const agentsRoutes = require("./agentsRoutes");
const authenticationsRoutes = require("./authenticationsRoutes");

// Définir les préfixes pour chaque groupe de routes
const basePath = {
    agents: "/agents",
    shifts: '/shifts',
    unavailabilities:'/unavailabilities',
    requests: '/requests',
    authentications: "/auth"
};

router.use(basePath.agents, agentsRoutes);
router.use(basePath.shifts, shiftsRoutes);
router.use(basePath.unavailabilities, unavailabilitiesRoutes );
router.use(basePath.requests, requestsRoutes);
router.use(basePath.authentications, authenticationsRoutes);

module.exports = router;