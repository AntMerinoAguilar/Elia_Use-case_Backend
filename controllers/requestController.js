const Request = require("../models/Request");
const Shift = require("../models/Shift");
const Notification = require("../models/Notification");
const Agent = require("../models/Agent");
const { archiveToHistory } = require("./historyController");

// Fonction pour récupérer toutes les demandes, triées par la plus récente
const getRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("requesterId", "name surname code") // Récupère nom, prénom et code du demandeur
      .populate("shiftId") // Récupère le shift lié
      .populate("targetAgentId", "name surname code") // Récupère nom, prénom et code de l'agent cible (si applicable)
      .sort({ createdAt: -1 }); // Trie les résultats du plus récent au plus ancien

    res.status(200).json(requests);
  } catch (err) {
    console.error("Erreur lors de la récupération des demandes :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des demandes." });
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Fonction pour récupérer les demandes d'un agent spécifique (soit comme demandeur, soit comme cible)
const getRequestsByAgent = async (req, res) => {
  try {
    const agentId = req.params.agentId;

    const requests = await Request.find({
      $or: [{ requesterId: agentId }, { targetAgentId: agentId }] // Récupère les requests où l'agent est demandeur ou cible
    })
      .populate("requesterId", "name surname code") // Infos du demandeur
      .populate("shiftId") // Infos du shift concerné
      .populate("targetAgentId", "name surname code") // Infos de l'agent cible
      .sort({ startTime: -1 }); // Trie les résultats du plus récent au plus ancien

    res.status(200).json(requests);
  } catch (err) {
    console.error("Erreur lors de la récupération des demandes de l'agent :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des demandes." });
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Fonction pour créer une demande de remplacement ou de swap
const createRequest = async (req, res) => {
  try {
    const {
      requesterId,
      shiftId,
      timeSlot,
      availableSlots,
      requestType,
      message,
      targetAgentId,
    } = req.body;

    // Vérifications de base
    if (!timeSlot || !timeSlot.startTime || !timeSlot.endTime) {
      return res.status(400).json({
        error: "Le créneau horaire souhaité (timeSlot) est obligatoire.",
      });
    }

    if (
      requestType === "Swap" &&
      (!availableSlots || availableSlots.length === 0)
    ) {
      return res.status(400).json({
        error:
          "Pour un Swap, il faut proposer au moins un créneau de disponibilité (availableSlots).",
      });
    }

    // Vérifier que l'agent possède bien le shift et que le timeSlot est strictement inclus
    const existingShift = await Shift.findOne({
      _id: shiftId,
      agentId: requesterId,
      startDate: { $lte: new Date(timeSlot.startTime) },
      endDate: { $gte: new Date(timeSlot.endTime) }
    });

    if (!existingShift) {
      return res.status(400).json({
        error: "Vous ne possédez pas ce shift ou le créneau demandé n'est pas strictement inclus dans ce shift.",
      });
    }

    const newRequest = new Request({
      requesterId,
      shiftId,
      timeSlot,
      availableSlots: requestType === "Swap" ? availableSlots : undefined,
      requestType,
      message,
      targetAgentId: targetAgentId || null,
    });

    await newRequest.save();

    // Gestion des notifications
    const requester = await Agent.findById(requesterId);
    if (!requester) {
      return res.status(404).json({ error: "Requester not found" });
    }

    if (targetAgentId) {
      // Cas 1: Swap ciblé ou Replacement ciblé -> Seul l'agent cible reçoit une notification
      const notification = new Notification({
        recipientId: targetAgentId,
        type: requestType === "Swap" ? "Swap Request" : "Replacement Request",
        message: `Nouvelle demande de ${requestType.toLowerCase()} de l'agent ${
          requester.code
        }.`,
      });
      await notification.save();
    } else {
      // Cas 2: Swap ouvert ou Replacement ouvert -> Tous les autres agents sauf le demandeur reçoivent une notification
      const agents = await Agent.find({ _id: { $ne: requesterId } });
      const notifications = agents.map((agent) => ({
        recipientId: agent._id,
        type: requestType === "Swap" ? "Swap Request" : "Replacement Request",
        message: `Un ${requestType.toLowerCase()} ouvert est disponible pour le shift de ${
          requester.code
        }.`,
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json(newRequest);
  } catch (err) {
    console.error("Erreur lors de la création de la demande :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la création de la demande" });
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Fonction pour accepter une demande de Swap ou de Remplacement
const acceptRequest = async (req, res) => {
  try {
    const { agentId, selectedSlot } = req.body;
    const requestId = req.params.id.trim();

    // Récupérer la demande et les infos associées
    const request = await Request.findById(requestId).populate("shiftId");
    if (!request) return res.status(404).json({ error: "Demande non trouvée" });

    const { requestType, targetAgentId, requesterId, shiftId, availableSlots, timeSlot } = request;

    // Vérifier que l'agent qui accepte existe
    const acceptingAgent = await Agent.findById(agentId);
    if (!acceptingAgent)
      return res.status(404).json({ error: "L'agent qui accepte n'existe pas." });

    // Vérifier que l'agent demandeur existe
    const requesterAgent = await Agent.findById(requesterId);
    if (!requesterAgent)
      return res.status(404).json({ error: "L'agent demandeur n'existe pas." });

    // Vérifier si l'agent a le droit d'accepter (si la demande est ciblée)
    if (targetAgentId && targetAgentId.toString() !== agentId) {
      return res.status(403).json({ error: "Vous n'êtes pas l'agent cible de cette demande." });
    }

      //Déclaration de la fonction pour créer des nouveaux shifts morcellés

      const createShiftIfValid = async (startDate, endDate, agent, replacementAgent = null) => {
      if (new Date(startDate) < new Date(endDate)) {  // Vérifie que le shift a une durée valide
        const shiftData = {
          agentId: agent._id,
          agentCode: agent.code,
          startDate,
          endDate,
          status: "Assigned",
          replacements: replacementAgent
            ? [{ replacementId: replacementAgent._id, startTime: startDate, endTime: endDate, status: "Confirmed" }]
            : []
        };

        return await Shift.create(shiftData);
      }
    };

    // Gestion du Swap
    if (requestType === "Swap") {
      if (!selectedSlot)
        return res.status(400).json({ error: "Un créneau doit être sélectionné pour un swap." });

      // Nouvelle logique de validation du créneau
      const selectedStartTime = new Date(selectedSlot.startTime).getTime();
      const selectedEndTime = new Date(selectedSlot.endTime).getTime();
      
      const validSlot = availableSlots.some(slot => {
        const slotStartTime = new Date(slot.startTime).getTime();
        const slotEndTime = new Date(slot.endTime).getTime();
        
        // Vérifie si le créneau sélectionné est compris dans le créneau disponible
        return selectedStartTime >= slotStartTime && selectedEndTime <= slotEndTime;
      });

      if (!validSlot)
        return res.status(400).json({ error: "Créneau choisi invalide." });

      // Vérifier que la durée du selectedSlot correspond à timeSlot
      const timeSlotDuration = new Date(timeSlot.endTime).getTime() - new Date(timeSlot.startTime).getTime();
      const selectedSlotDuration = selectedEndTime - selectedStartTime;
      if (selectedSlotDuration !== timeSlotDuration) {
        return res.status(400).json({ error: "La durée du créneau choisi ne correspond pas à la durée du timeSlot initial." });
      }

      // Trouver les shifts concernés
      const requesterShift = await Shift.findById(shiftId._id);
      if (!requesterShift) return res.status(404).json({ error: "Shift du demandeur non trouvé." });

      const acceptingAgentShift = await Shift.findOne({
        agentId: agentId,
        startDate: { $lte: selectedSlot.endTime },
        endDate: { $gte: selectedSlot.startTime }
      });
      if (!acceptingAgentShift)
        return res.status(400).json({ error: "L'agent cible n'a pas de shift correspondant." });


      // Créer les nouveaux shifts pour le demandeur
      await createShiftIfValid(requesterShift.startDate, timeSlot.startTime, requesterAgent); //Création d'un shift pour l'agent initial avant la période de swap (s'il y a des heures avant)
      await createShiftIfValid(timeSlot.startTime, timeSlot.endTime, acceptingAgent, requesterAgent); //Création du shift pendant la période de swap et assignation à l'agent acceptant.
      await createShiftIfValid(timeSlot.endTime, requesterShift.endDate, requesterAgent); //Création d'un shift pour l'agent initial après la période de swap (s'il y a des heures après).

      // Créer les nouveaux shifts pour l'agent acceptant
      await createShiftIfValid(acceptingAgentShift.startDate, selectedSlot.startTime, acceptingAgent);  //Création d'un shift pour l'agent acceptant avant la période de swap (s'il y a des heures avant)
      await createShiftIfValid(selectedSlot.startTime, selectedSlot.endTime, requesterAgent, acceptingAgent);  //Création du shift pendant la période de swap et assignation à l'agent initial.
      await createShiftIfValid(selectedSlot.endTime, acceptingAgentShift.endDate, acceptingAgent);    //Création d'un shift pour l'agent acceptant après la période de swap (s'il y a des heures après).


            // Supprimer les shifts originaux
            await Shift.deleteOne({ _id: requesterShift._id });
            await Shift.deleteOne({ _id: acceptingAgentShift._id });
          }

    // Gestion du Replacement
    if (requestType === "Replacement") {
      const existingShift = await Shift.findById(shiftId._id);
      if (!existingShift) return res.status(404).json({ error: "Shift non trouvé." });


      // Vérifier que l'agent acceptant n'a pas déjà un shift qui chevauche
      const conflictingShift = await Shift.findOne({
        agentId,
        $or: [
          {
            startDate: { $lt: timeSlot.endTime },
            endDate: { $gt: timeSlot.startTime }
          }
        ]
      });

      if (conflictingShift)
        return res.status(400).json({ error: "Vous avez déjà un shift à ce moment-là." });

      // Calculer la durée du remplacement en heures
      const replacementDurationMs = new Date(timeSlot.endTime) - new Date(timeSlot.startTime);
      const replacementDurationHours = replacementDurationMs / (1000 * 60 * 60);

      // Mettre à jour la balance des agents
      await Agent.findByIdAndUpdate(requesterId, { $inc: { balance: -replacementDurationHours } });
      await Agent.findByIdAndUpdate(agentId, { $inc: { balance: replacementDurationHours } });

      // Création des shifts pour le Replacement
      await createShiftIfValid(existingShift.startDate, timeSlot.startTime, requesterAgent); //Création d'un shift pour l'agent initial avant la période de remplacement (s'il y a des heures avant)
      await createShiftIfValid(timeSlot.startTime, timeSlot.endTime, acceptingAgent, requesterAgent); //Création du shift pendant la période de remplacement et assignation à l'agent acceptant.
      await createShiftIfValid(timeSlot.endTime, existingShift.endDate, requesterAgent); //Création d'un shift pour l'agent initial après la période de remplacement (s'il y a des heures après)

      // Supprimer le shift original
      await Shift.deleteOne({ _id: existingShift._id });
    }

    // Mettre à jour la demande comme "Approved"
    request.status = "Approved";
    await request.save();

    // Archiver la demande dans l'historique
    await archiveToHistory(request, "Request Approved");

    // Supprimer la request après archivage
    await Request.findByIdAndDelete(requestId);

    // Envoyer des notifications
    await Notification.insertMany([
      {
        recipientId: requesterId,
        type: "Status Update",
        message: `Votre demande de ${requestType.toLowerCase()} a été acceptée par ${acceptingAgent.code}.`,
      },
      {
        recipientId: acceptingAgent._id,
        type: "Status Update",
        message: `Vous avez accepté un ${requestType.toLowerCase()} avec ${requesterAgent.code}.`,
      },
    ]);

    res.json({
      message: `${requestType} validé et shifts mis à jour.`,
      updatedRequest: request,
    });
  } catch (err) {
    console.error("Erreur lors de l'acceptation de la demande :", err);
    res.status(500).json({ error: "Erreur serveur lors de l'acceptation de la demande." });
  }
};

module.exports = {
  getRequests,
  getRequestsByAgent,
  createRequest,
  acceptRequest,
};
