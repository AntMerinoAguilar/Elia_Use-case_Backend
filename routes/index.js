// Ce fichier va centraliser l'importation des différentes routes.
// Chaque membre de l'équipe ajoutera ses fichiers de routes dans ce dossier et les exportera ici.

const express = require("express");
const router = express.Router();

// Importer les sous-routes
const agentsRoutes = require("./agentsRoutes");

// Définir les préfixes pour chaque groupe de routes
const basePath = {
    agents: "/agents",
};

router.use(basePath.agents, agentsRoutes);

module.exports = router;