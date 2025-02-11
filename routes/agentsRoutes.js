const express = require("express");
const router = express.Router();
const requireAuthMiddleware = require("../middlewares/authMiddleware");
const agentController = require("../controllers/agentController");

// Routes pour les agents
router.get("/", requireAuthMiddleware, agentController.getAllAgents);
router.get("/:id", requireAuthMiddleware, agentController.getAgentById);
router.post("/", requireAuthMiddleware, agentController.createAgent);
router.put("/:id", requireAuthMiddleware, agentController.updateAgent);
router.delete("/:id", requireAuthMiddleware, agentController.deleteAgent);

module.exports = router;
