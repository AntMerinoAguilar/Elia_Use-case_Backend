const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Routes pour les Notifications
router.post("/", notificationController.createNotification);
router.get("/", notificationController.getAllNotifications);
router.get("/:agentId", notificationController.getAgentNotifications);
router.put("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);
router.delete(
  "/agent/:agentId",
  notificationController.deleteAgentNotifications
);

module.exports = router;
