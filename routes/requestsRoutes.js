const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Shift = require('../models/Shift');
const Notification = require('../models/Notification')

//API REQUESTS

//Créer une demande de remplacement ou de switch
router.post('/', async (req, res) => {
    try {
    const { requesterId, shiftId, timeSlot, availableSlots, requestType, message, targetAgentId } = req.body;

    // Vérification des champs obligatoires
    if (!timeSlot || !timeSlot.startTime || !timeSlot.endTime) {
        return res.status(400).json({ error: "Le créneau horaire souhaité (timeSlot) est obligatoire." });
    }

    if (requestType === 'Swap' && (!availableSlots || availableSlots.length === 0)) {
        return res.status(400).json({ error: "Pour un Swap, il faut proposer au moins un créneau disponible (availableSlots)." });
    }

    
    // Création de la demande
    const newRequest = new Request({
        requesterId,
        shiftId,
        timeSlot,
        availableSlots: requestType === 'Swap' ? availableSlots : undefined, // Seulement pour les swaps
        requestType,
        message,
      targetAgentId: targetAgentId || null // Si pas de cible, reste null
    });

    await newRequest.save();

    // Gestion des notifications
    if (targetAgentId) {
    
    
        // Cas 1: Demande avec cible spécifique (Remplacement ou Swap ciblé)
        const notification = new Notification({
        recipientId: targetAgentId,
        type: requestType === 'Swap' ? 'Swap Request' : 'Replacement Request',
        message: `Nouvelle demande de ${requestType.toLowerCase()} de l'agent ${requesterId}.`
        });
        await notification.save();
    } else {
    
    
        // Cas 2: Swap ouvert ou Remplacement ouvert 
        const requester = await Agent.findById(requesterId);

        if (!requester) {
        return res.status(404).json({ error: 'Requester not found' });
    }
        const agents = await Agent.find({ 
        _id: { $ne: requesterId }, 
        });

        const notifications = agents.map(agent => ({
        recipientId: agent._id,
        type: requestType === 'Swap' ? 'Open Swap Request' : 'Open Replacement Request',
        message: `Un ${requestType.toLowerCase()} ouvert est disponible pour le shift de ${requester.code}.` //accès au code ici?
        }));

        await Notification.insertMany(notifications);
    }

    res.status(201).json(newRequest);
    } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de la création de la demande' });
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



//Appliquer demande de Swap en approuvant par destinataire
router.put('/:id/approve', async (req, res) => {
    try {
        const { selectedSlot } = req.body;

        // Récupérer la demande avec les relations nécessaires
        const request = await Request.findById(req.params.id)
            .populate('requesterId')
            .populate('targetAgentId')
            .populate('shiftId');

        if (!request) return res.status(404).json({ error: 'Demande non trouvée' });

        // Vérifier que le créneau choisi fait partie des options proposées
        const validSlot = request.availableSlots.find(slot =>
            new Date(selectedSlot.startTime).getTime() >= slot.startTime.getTime() &&
            new Date(selectedSlot.endTime).getTime() <= slot.endTime.getTime()
        );

        if (!validSlot) {
            return res.status(400).json({ error: 'Créneau non valide' });
        }

        // Vérifier que la durée du selectedSlot est égale à la durée du timeSlot initial
        const timeSlotDuration = new Date(request.timeSlot.endTime).getTime() - new Date(request.timeSlot.startTime).getTime();
        const selectedSlotDuration = new Date(selectedSlot.endTime).getTime() - new Date(selectedSlot.startTime).getTime();

        if (selectedSlotDuration !== timeSlotDuration) {
            return res.status(400).json({ error: 'La durée du créneau choisi ne correspond pas à la durée du timeSlot initial.' });
        }

        // Récupérer le shift du demandeur
        const requesterShift = await Shift.findById(request.shiftId);
        if (!requesterShift) {
            return res.status(400).json({ error: 'Shift du demandeur introuvable' });
        }

        // Vérifier si un agent cible a été défini
        if (request.targetAgentId) {
            
            // Vérifier que l'agent cible est disponible (n'a pas déjà un shift sur cette période)
            const existingShift = await Shift.findOne({
                agentId: request.targetAgentId._id,
                $or: [
                    { startDate: { $lt: requesterShift.endDate }, endDate: { $gt: requesterShift.startDate } }
                ]
            });

            if (existingShift) {
                return res.status(400).json({ error: "L’agent cible a déjà un shift à ce moment-là" });
            }
        } else {

            //Peut être chercher dans les params et que la personne qui clique soit la personne en question?
            
            // Si aucun agent cible n'est défini (swap ouvert), trouver un agent disponible
            const availableAgents = await Agent.find({
                _id: { $ne: request.requesterId }, // Exclure le demandeur lui-même
                _id: { $nin: await Shift.distinct('agentId', {
                    startDate: { $lt: requesterShift.endDate }, //utilité dans les secteurs à 2 agents mais pas dans notre cas
                    endDate: { $gt: requesterShift.startDate }
                })}
            });

            if (availableAgents.length === 0) {
                return res.status(400).json({ error: 'Aucun agent disponible pour cet échange.' });
            }

            // Prendre le premier agent disponible (on pourrait aussi envoyer une notification à plusieurs agents)
            request.targetAgentId = availableAgents[0]._id; // à changer
        }

        // Quid du pas d'agent cible?

        // Récupérer le shift de l'agent cible
        const targetShift = await Shift.findOne({
            agentId: request.targetAgentId._id,
            startDate: { $gte: requesterShift.startDate, $lt: requesterShift.endDate }
        });

        if (!targetShift) {
            return res.status(400).json({ error: 'Shift de l’agent cible non trouvé' });
        }

        // Échanger les agentId des shifts
        const tempAgentId = requesterShift.agentId;
        requesterShift.agentId = targetShift.agentId;
        targetShift.agentId = tempAgentId;

        await requesterShift.save();
        await targetShift.save();

        // Mettre à jour le statut de la requête
        request.status = 'Approved';
        await request.save();

        //Effacer request dans la db?

        // Ajouter une notification pour le demandeur
        const notification = new Notification({
            recipientId: request.requesterId._id,
            type: 'Status Update',
            message: `Votre demande de swap a été acceptée pour le créneau ${selectedSlot.startTime} - ${selectedSlot.endTime}.`
        });
        await notification.save();

        res.json({ message: 'Swap validé', updatedRequest: request });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de l'approbation du swap" });
    }
});






//Appliquer demande demande en changeant status
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