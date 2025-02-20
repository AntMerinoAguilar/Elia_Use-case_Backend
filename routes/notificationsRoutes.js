const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const requireAuthMiddleware = require("../middlewares/authMiddleware");

// Routes pour les Notifications
router.post("/", requireAuthMiddleware, notificationController.createNotification);
router.get("/", requireAuthMiddleware, notificationController.getAllNotifications);
router.get("/:agentId", requireAuthMiddleware, notificationController.getAgentNotifications);
router.get("/me", requireAuthMiddleware, notificationController.getMyNotifications);
router.put("/:id/read", requireAuthMiddleware, notificationController.markAsRead);
router.delete("/:id", requireAuthMiddleware, notificationController.deleteNotification);
router.delete(
  "/agent/:agentId",
  notificationController.deleteAgentNotifications
);

module.exports = router;
