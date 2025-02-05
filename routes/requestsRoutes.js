const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Shift = require('../models/Shift');

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

//Modifier demande
router.put('/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
    // Trouver la demande originale avec tous les détails
    const request = await Request.findById(req.params.id)
        .populate('requesterId')
        .populate('targetAgentId')
        .populate('shiftId');

    // Vérifier si c'est un swap et s'il est approuvé
    if (request.requestType === 'Swap' && status === 'Approved') {
      // Trouver le shift du demandeur
        const requesterShift = await Shift.findById(request.shiftId);
    
      // Trouver le shift du agent ciblé
        const targetShift = await Shift.findOne({ 
        agentId: request.targetAgentId._id,
        startDate: { $gte: requesterShift.startDate, $lt: requesterShift.endDate }
        });

        if (!requesterShift || !targetShift) {
        return res.status(400).json({ error: 'Shifts correspondants non trouvés' });
        }

      // Échanger les agentId des shifts
        const tempAgentId = requesterShift.agentId;
        requesterShift.agentId = targetShift.agentId;
        targetShift.agentId = tempAgentId;

      // Sauvegarder les modifications des shifts
        await requesterShift.save();
        await targetShift.save();
    }

    // Mettre à jour le statut de la demande
    const updatedRequest = await Request.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    );

    res.json(updatedRequest);
    } catch (err) {
    console.error(err);
    res.status(400).json({ 
        error: 'Erreur lors de la mise à jour de la demande', 
        details: err.message 
    });
    }
});

// Supprimer une demande par son ID
router.delete('/:id', async (req, res) => {
    try {
    const deletedRequest = await Request.findByIdAndDelete(req.params.id);
    
        if (!deletedRequest) {
        return res.status(404).json({ error: 'Demande non trouvée' });
    }
    
    res.json({ 
        message: 'Demande supprimée avec succès',
        deletedRequest: deletedRequest 
    });
    } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de la demande' });
    }
});

module.exports = router