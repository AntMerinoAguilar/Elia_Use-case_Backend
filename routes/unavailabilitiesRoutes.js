const express = require('express');
const router = express.Router();
const Unavailability = require('../models/Unavailability');

// API UNAVAILABILITIES

//Ajouter une indisponibilité
router.post('/', async (req, res) => {
  try {
    const unavailability = new Unavailability(req.body);
    await unavailability.save();
    res.status(201).json(unavailability);
  } catch (err) {
    res.status(400).json({ error: "Erreur lors de la création de l'indisponibilité" });
  }
});

//Lister les indisponibilités
router.get('/', async (req, res) => {
  try {
    const unavailabilities = await Unavailability.find().populate('agentId').populate('relatedShiftId');
    res.json(unavailabilities);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

//Mettre à jour le statut d'une indisponibilité
router.put('/', async (req, res) => {
  const { status } = req.body;
  try {
    const updated = await Unavailability.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

module.exports = router
