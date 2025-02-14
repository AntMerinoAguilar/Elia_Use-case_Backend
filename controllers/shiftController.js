const Shift = require("../models/Shift");
const Agent = require("../models/Agent");

// Créer un shift
const createShift = async (req, res) => {
  try {
    const agent = await Agent.findById(req.body.agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent non trouvé" });
    }
    const shift = new Shift({
      ...req.body,
      agentCode: agent.code, // Ajouter le code de l'agent
    });
    await shift.save();
    res.status(201).json(shift);
  } catch (err) {
    res.status(400).json({ error: "Erreur lors de la création du shift" });
  }
};

// Récupérer tous les shifts
const getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.find()
      .populate("agentId")
      .populate("replacements.replacementId")
      .sort({ startDate: -1 });
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Récupérer les shifts de l'agent connecté
const getCurrentAgentShifts = async (req, res) => {
  try {
    const agentId = req.agent.id; // Récupérer l'agent connecté via le middleware
    const shifts = await Shift.find({ agentId });
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des shifts" });
  }
};


// Mettre à jour un shift
const updateShift = async (req, res) => {
  try {
    const updatedShift = await Shift.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedShift)
      return res.status(404).json({ error: "Shift non trouvé" });
    res.json(updatedShift);
  } catch (err) {
    res.status(400).json({ error: "Erreur lors de la mise à jour du shift" });
  }
};

// Supprimer un shift
const deleteShift = async (req, res) => {
  try {
    const deletedShift = await Shift.findByIdAndDelete(req.params.id);
    if (!deletedShift)
      return res.status(404).json({ error: "Shift non trouvé" });
    res.json({ message: "Shift supprimé" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  createShift,
  getAllShifts,
  getCurrentAgentShifts,
  updateShift,
  deleteShift,
};
