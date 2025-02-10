const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Shift = require('../models/Shift');
const Notification = require('../models/Notification');
const Agent = require('../models/Agent');
const {archiveToHistory} = require('../controller/historyController');
const requireAuthMiddleware = require("../middlewares/authMiddleware");

//API REQUESTS

//Créer une demande de remplacement ou de switch
router.post('/', requireAuthMiddleware, async (req, res) => {
    try {
        const { requesterId, shiftId, timeSlot, availableSlots, requestType, message, targetAgentId } = req.body;

        if (!timeSlot || !timeSlot.startTime || !timeSlot.endTime) {
            return res.status(400).json({ error: "Le créneau horaire souhaité (timeSlot) est obligatoire." });
        }

        if (requestType === 'Swap' && (!availableSlots || availableSlots.length === 0)) {
            return res.status(400).json({ error: "Pour un Swap, il faut proposer au moins un créneau de disponibilité (availableSlots)." });
        }

        const newRequest = new Request({
            requesterId,
            shiftId,
            timeSlot,
            availableSlots: requestType === 'Swap' ? availableSlots : undefined,
            requestType,
            message,
            targetAgentId: targetAgentId || null
        });

        await newRequest.save();

        // Gestion des notifications
        const requester = await Agent.findById(requesterId);
        if (!requester) {
            return res.status(404).json({ error: 'Requester not found' });
        }

        if (targetAgentId) {
            // Cas 1: Swap ciblé ou Replacement ciblé -> Seul l'agent cible reçoit une notification
            const notification = new Notification({
                recipientId: targetAgentId,
                type: requestType === 'Swap' ? 'Swap Request' : 'Replacement Request',
                message: `Nouvelle demande de ${requestType.toLowerCase()} de l'agent ${requester.code}.`
            });
            await notification.save();
        } else {
            // Cas 2: Swap ouvert ou Replacement ouvert -> Tous les autres agents sauf le demandeur reçoivent une notification
            const agents = await Agent.find({ _id: { $ne: requesterId } });

            const notifications = agents.map(agent => ({
                recipientId: agent._id,
                type: requestType === 'Swap' ? 'Swap Request' : 'Replacement Request',
                message: `Un ${requestType.toLowerCase()} ouvert est disponible pour le shift de ${requester.code}.`
            }));

            await Notification.insertMany(notifications);
        }

        res.status(201).json(newRequest);
    } catch (err) {
        console.error("Erreur lors de la création de la demande :", err);
        res.status(500).json({ error: 'Erreur serveur lors de la création de la demande' });
    }
});


//Accepter une demande de Swap et de Remplacement
router.put('/:id/accept', requireAuthMiddleware, async (req, res) => {
    try {
        const { agentId, selectedSlot } = req.body;
        const requestId = req.params.id.trim();

        //Récupérer la demande et les infos associées
        const request = await Request.findById(requestId).populate('shiftId');
        if (!request) return res.status(404).json({ error: 'Demande non trouvée' });

        const { requestType, targetAgentId, requesterId, shiftId, availableSlots } = request;

        //Vérifier que l'agent qui accepte existe
        const acceptingAgent = await Agent.findById(agentId);
        if (!acceptingAgent) return res.status(404).json({ error: "L'agent qui accepte n'existe pas." });

        //Vérifier que l'agent demandeur existe
        const requesterAgent = await Agent.findById(requesterId);
        if (!requesterAgent) return res.status(404).json({ error: "L'agent demandeur n'existe pas." });

        //Vérifier si l'agent a le droit d'accepter (si la demande est ciblée)
        if (targetAgentId && targetAgentId.toString() !== agentId) {
            return res.status(403).json({ error: "Vous n'êtes pas l'agent cible de cette demande." });
        }

        //Vérification spécifique au Swap (créneau + échange)
        if (requestType === 'Swap') {
            if (!selectedSlot) return res.status(400).json({ error: 'Un créneau doit être sélectionné pour un swap.' });

            const validSlot = availableSlots.some(slot =>
                new Date(selectedSlot.startTime).getTime() === new Date(slot.startTime).getTime() &&
                new Date(selectedSlot.endTime).getTime() === new Date(slot.endTime).getTime()
            );
            if (!validSlot) return res.status(400).json({ error: 'Créneau choisi invalide.' });

            //Mettre à jour la demande avec l'agent qui accepte si swap ouvert
            if (!targetAgentId) request.targetAgentId = agentId;
        }

        //Vérification spécifique au Replacement (éviter conflit d'horaires)
        if (requestType === 'Replacement') {
            const existingShift = await Shift.findOne({
                agentId,
                $or: [{ startDate: { $lt: shiftId.endDate }, endDate: { $gt: shiftId.startDate } }]
            });
            if (existingShift) return res.status(400).json({ error: "Vous avez déjà un shift à ce moment-là." });

            // Calculer la durée du shift en heures
            const shiftDurationMs = new Date(shiftId.endDate) - new Date(shiftId.startDate);
            const shiftDurationHours = shiftDurationMs / (1000 * 60 * 60); // Convertir en heures

            // Mettre à jour la balance des agents
            await Agent.findByIdAndUpdate(requesterId, { $inc: { balance: -shiftDurationHours } });
            await Agent.findByIdAndUpdate(agentId, { $inc: { balance: shiftDurationHours } });
        }

        //Mettre à jour le shift avec le nouvel agent
        await Shift.findByIdAndUpdate(shiftId._id, {
            agentId: acceptingAgent._id,
            agentCode: acceptingAgent.code
        });

        //Mettre à jour la demande comme "Approved"
        request.status = 'Approved';
        await request.save();
        
       

        //Notifications
        await Notification.insertMany([
            {
                recipientId: requesterId,
                type: 'Status Update',
                message: `Votre demande de ${requestType.toLowerCase()} a été acceptée par ${acceptingAgent.code}.`
            },
            {
                recipientId: acceptingAgent._id,
                type: 'Status Update',
                message: `Vous avez accepté un ${requestType.toLowerCase()} avec ${requesterAgent.code}.`
            }
        ]);

        res.json({ message: `${requestType} validé et shift mis à jour.`, updatedRequest: request });

         //Archive dans l'historique quand Approved
        
        await archiveToHistory(request, 'Request Approved');
        


        //Supprimer la request quand archivée
        await Request.findByIdAndDelete(requestId)

    } catch (err) {
        console.error("Erreur lors de l'acceptation de la demande :", err);
        res.status(500).json({ error: "Erreur serveur lors de l'acceptation de la demande." });
    }
});

module.exports = router