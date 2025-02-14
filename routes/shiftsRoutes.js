const express = require("express");
const router = express.Router();
const requireAuthMiddleware = require("../middlewares/authMiddleware");
const shiftController = require("../controllers/shiftController");

// Routes pour les shifts
router.post("/", requireAuthMiddleware, shiftController.createShift);
router.get("/", requireAuthMiddleware, shiftController.getAllShifts);
router.get("/me", requireAuthMiddleware, shiftController.getCurrentAgentShifts);
router.put("/:id", requireAuthMiddleware, shiftController.updateShift);
router.delete("/:id", requireAuthMiddleware, shiftController.deleteShift);

module.exports = router;
