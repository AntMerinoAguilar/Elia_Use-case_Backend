const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');
const Agent = require('../models/Agent');
const requireAuthMiddleware = require("../middlewares/authMiddleware");

 //API SHIFTS

//  Créer un shift
router.post('/', requireAuthMiddleware, async (req, res) => {
  try {
    const agent = await Agent.findById(req.body.agentId);
      const shift = new Shift({
      ...req.body,
      agentCode: agent.code // Ajouter le code de l'agent
    });
    await shift.save();
    res.status(201).json(shift);
  } catch (err) {
    res.status(400).json({ error: 'Erreur lors de la création du shift' });
  }
});

//  Récupérer tous les shifts
router.get('/', requireAuthMiddleware, async (req, res) => {
  try {
    const shifts = await Shift.find().populate('agentId').populate('replacements.replacementId');
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

//Mettre à jour un shift
router.put('/:id', requireAuthMiddleware, async (req, res) => {
  try {
    const updatedShift = await Shift.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedShift) return res.status(404).json({ error: 'Shift non trouvé' });
    res.json(updatedShift);
  } catch (err) {
    res.status(400).json({ error: 'Erreur lors de la mise à jour du shift' });
  }
});

//  Supprimer un shift
router.delete('/:id', requireAuthMiddleware, async (req, res) => {
  try {
    const deletedShift = await Shift.findByIdAndDelete(req.params.id);
    if (!deletedShift) return res.status(404).json({ error: 'Shift non trouvé' });
    res.json({ message: 'Shift supprimé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;