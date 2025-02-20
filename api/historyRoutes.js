const express = require("express");
const router = express.Router();
const historyController= require("../controllers/historyController");
const requireAuthMiddleware = require("../middlewares/authMiddleware");

// Route pour la connexion
router.get("/", requireAuthMiddleware, historyController.getHistory);
router.get("/:id", requireAuthMiddleware, historyController.getHistoryByAgent )


module.exports = router;