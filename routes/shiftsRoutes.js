const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');

 //API SHIFTS

//  Créer un shift
router.post('/', async (req, res) => {
  try {
    const shift = new Shift(req.body);
    await shift.save();
    res.status(201).json(shift);
  } catch (err) {
    res.status(400).json({ error: 'Erreur lors de la création du shift' });
  }
});

//  Récupérer tous les shifts
router.get('/', async (req, res) => {
  try {
    const shifts = await Shift.find().populate('agentId').populate('replacements.replacementId');
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

//  Supprimer un shift
router.delete('/:id', async (req, res) => {
  try {
    const deletedShift = await Shift.findByIdAndDelete(req.params.id);
    if (!deletedShift) return res.status(404).json({ error: 'Shift non trouvé' });
    res.json({ message: 'Shift supprimé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;