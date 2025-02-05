const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

//API REQUESTS

//Créer une demande de remplacement ou de switch
router.post('/', async (req, res) => {
  try {
    const request = new Request(req.body);
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: 'Erreur lors de la création de la demande' });
  }
});

//Récupérer toutes les demandes
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find().populate('requesterId').populate('shiftId').populate('targetAgentId');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

//Récupérer les demandes d'un agent spécifique
router.get('/agent/:agentId', async (req, res) => {
  try {
    const agentId = req.params.agentId;
    const requests = await Request.find({ $or: [{ requesterId: agentId }, { targetAgentId: agentId }] })
      .populate('requesterId')
      .populate('shiftId')
      .populate('targetAgentId');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des demandes' });
  }
});


//Mettre à jour le statut d'une demande
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(updatedRequest);
  } catch (err) {
    res.status(400).json({ error: 'Erreur lors de la mise à jour de la demande' });
  }
});