const Unavailability = require("../models/Unavailability");
const Notification = require("../models/Notification");

// Ajouter une indisponibilité
const createUnavailability = async (req, res) => {
  try {
    const unavailability = new Unavailability(req.body);
    await unavailability.save();

    // Logique pour ajouter une notification, il faut l'améliorer et rajouter la logique pour divers cas

    // Création de la notification pour l'agent émetteur
    const notification = new Notification({
      recipientId: unavailability.agentId,
      type: "Unavailability Signaled",
      message: `Vous avez déclaré une indisponibilité du ${unavailability.startDate} au ${unavailability.endDate}.`,
    });

    await notification.save();

    res.status(201).json(unavailability);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Erreur lors de la création de l'indisponibilité" });
  }
};

// Lister toutes les indisponibilités
const getAllUnavailabilities = async (req, res) => {
  try {
    const unavailabilities = await Unavailability.find()
      .populate("agentId")
      .populate("relatedShiftId");
    res.json(unavailabilities);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Mettre à jour le statut d'une indisponibilité
const updateUnavailabilityStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const updated = await Unavailability.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ error: "Indisponibilité non trouvée" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Erreur lors de la mise à jour du statut" });
  }
};

// Supprimer une indisponibilité
const deleteUnavailability = async (req, res) => {
  try {
    const deletedUnavailability = await Unavailability.findByIdAndDelete(
      req.params.id
    );
    if (!deletedUnavailability) {
      return res.status(404).json({ error: "Indisponibilité non trouvée" });
    }
    res.json({
      message: "Indisponibilité supprimée avec succès",
      deletedUnavailability,
    });
  } catch (err) {
    res.status(500).json({
      error: "Erreur serveur lors de la suppression de l'indisponibilité",
    });
  }
};

module.exports = {
  createUnavailability,
  getAllUnavailabilities,
  updateUnavailabilityStatus,
  deleteUnavailability,
};
