const express = require('express');
const router = express.Router();
const Unavailability = require('../models/Unavailability');
const Notification= require('../models/Notification');

// API UNAVAILABILITIES

//Ajouter une indisponibilité
router.post('/', async (req, res) => {
  try {
    const unavailability = new Unavailability(req.body);
    await unavailability.save();

    //Logique pour ajouter une notification, il faut l'améliorer et rajouter la 
    //logique pour divers cas

    //Notification à l'emetteur de l'indisponibilité

    const notification = new Notification({ 
      recipientId: unavailability.agentId,
      type: 'Unavailability Added',
      message: `Vous avez déclaré une indisponibilité du ${unavailability.startDate} au ${unavailability.endDate}.`
    });

    await notification.save();



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
router.put('/:id', async (req, res) => {
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

// Supprimer une indisponibilité par son ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedUnavailability = await Unavailability.findByIdAndDelete(req.params.id);
    
    if (!deletedUnavailability) {
      return res.status(404).json({ error: 'Indisponibilité non trouvée' });
    }
    
    res.json({ 
      message: 'Indisponibilité supprimée avec succès',
      deletedUnavailability: deletedUnavailability 
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'indisponibilité' });
  }
});

module.exports = router
