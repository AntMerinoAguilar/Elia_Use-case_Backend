const express = require("express");
const router = express.Router();
const requireAuthMiddleware = require("../middlewares/authMiddleware");
const agentController = require("../controllers/agentController");

// Endpoint pour récupérer l'agent connecté
router.get("/me", requireAuthMiddleware, agentController.getCurrentAgent); // la route /me est placée en haut pour indiquer qu’elle est prioritaire (avant / et /:id)

// Routes pour les agents
router.get("/", requireAuthMiddleware, agentController.getAllAgents);
router.get("/:id", requireAuthMiddleware, agentController.getAgentById);
router.post("/", requireAuthMiddleware, agentController.createAgent);
router.put("/:id", requireAuthMiddleware, agentController.updateAgent);
router.delete("/:id", requireAuthMiddleware, agentController.deleteAgent);

module.exports = router;
