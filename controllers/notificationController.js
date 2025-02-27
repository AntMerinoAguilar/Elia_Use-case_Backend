const Notification = require("../models/Notification");

// Créer une notification
const createNotification = async (req, res) => {
  try {
    const { recipientId, type, message } = req.body;
    const notification = new Notification({ recipientId, type, message });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Erreur lors de la création de la notification" });
  }
};

// Récupérer toutes les notifications
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Récupérer les notifications d'un agent
const getAgentNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.params.agentId,
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};


const getMyNotifications = async (req, res) => {
  try {
    
    const agentId = req.agent._id
    const notifications = await Notification.find({
    recipientId: agentId
    }).sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (err) {
    
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Marquer une notification comme lue
const markAsRead = async (req, res) => {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(updatedNotification);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Erreur lors de la mise à jour de la notification" });
  }
};

// Supprimer une notification
const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification supprimée" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Supprimer toutes les notifications d'un agent
const deleteAgentNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipientId: req.params.agentId });
    res.json({ message: "Toutes les notifications supprimées" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  createNotification,
  getAllNotifications,
  getAgentNotifications,
  getMyNotifications,
  markAsRead,
  deleteNotification,
  deleteAgentNotifications,
};
