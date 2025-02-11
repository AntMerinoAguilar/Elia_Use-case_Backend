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
      .sort({ createdAt: -1 }); // Trie les résultats du plus récent au plus ancien

    res.status(200).json(requests);
  } catch (err) {
    console.error("Erreur lors de la récupération des demandes de l'agent :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des demandes." });
  }
};





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

// Fonction pour accepter une demande de Swap ou de Remplacement
const acceptRequest = async (req, res) => {
  try {
    const { agentId, selectedSlot } = req.body;
    const requestId = req.params.id.trim();

    //Récupérer la demande et les infos associées
    const request = await Request.findById(requestId).populate("shiftId");
    if (!request) return res.status(404).json({ error: "Demande non trouvée" });

    const { requestType, targetAgentId, requesterId, shiftId, availableSlots } = request;

    //Vérifier que l'agent qui accepte existe
    const acceptingAgent = await Agent.findById(agentId);
    if (!acceptingAgent)
      return res.status(404).json({ error: "L'agent qui accepte n'existe pas." });

    //Vérifier que l'agent demandeur existe
    const requesterAgent = await Agent.findById(requesterId);
    if (!requesterAgent)
      return res.status(404).json({ error: "L'agent demandeur n'existe pas." });

    //Vérifier si l'agent a le droit d'accepter (si la demande est ciblée)
    if (targetAgentId && targetAgentId.toString() !== agentId) {
      return res.status(403).json({ error: "Vous n'êtes pas l'agent cible de cette demande." });
    }

    //Gestion du Swap
    if (requestType === "Swap") {
      if (!selectedSlot)
        return res.status(400).json({ error: "Un créneau doit être sélectionné pour un swap." });

      //Vérifier que le créneau choisi est bien dans `availableSlots`
      const validSlot = availableSlots.some(
        (slot) =>
          new Date(selectedSlot.startTime).getTime() === new Date(slot.startTime).getTime() &&
          new Date(selectedSlot.endTime).getTime() === new Date(slot.endTime).getTime()
      );
      if (!validSlot)
        return res.status(400).json({ error: "Créneau choisi invalide." });

      // Vérifier que la durée du `selectedSlot` correspond à `timeSlot`
      const timeSlotDuration = new Date(request.timeSlot.endTime).getTime() - new Date(request.timeSlot.startTime).getTime();
      const selectedSlotDuration = new Date(selectedSlot.endTime).getTime() - new Date(selectedSlot.startTime).getTime();
      if (selectedSlotDuration !== timeSlotDuration) {
        return res.status(400).json({ error: "La durée du créneau choisi ne correspond pas à la durée du timeSlot initial." });
      }

      //Trouver le shift du demandeur
      const requesterShift = await Shift.findById(shiftId._id);
      if (!requesterShift) return res.status(404).json({ error: "Shift du demandeur non trouvé." });

      //Trouver le shift de l'agent qui accepte (pas de recherche forcée, il est déjà validé par `availableSlots`)
      const acceptingAgentShift = await Shift.findOne({
        agentId: agentId,
        startDate: { $gte: selectedSlot.startTime, $lt: selectedSlot.endTime }
      });

      if (!acceptingAgentShift)
        return res.status(400).json({ error: "L'agent cible n'a pas de shift correspondant." });

      //Échanger les shifts entre le demandeur et l'acceptant
      await Shift.findByIdAndUpdate(requesterShift._id, {
        agentId: acceptingAgent._id,
        agentCode: acceptingAgent.code,
      });

      await Shift.findByIdAndUpdate(acceptingAgentShift._id, {
        agentId: requesterAgent._id,
        agentCode: requesterAgent.code,
      });

      //Mettre à jour la demande avec l'agent cible (si swap ouvert)
      if (!targetAgentId) request.targetAgentId = agentId;
    }

    //Gestion du Replacement
    if (requestType === "Replacement") {
      const existingShift = await Shift.findOne({
        agentId,
        startDate: shiftId.startDate,
        endDate: shiftId.endDate,
      });

      if (existingShift)
        return res.status(400).json({ error: "Vous avez déjà un shift à ce moment-là." });

      //Calculer la durée du shift en heures
      const shiftDurationMs = new Date(shiftId.endDate) - new Date(shiftId.startDate);
      const shiftDurationHours = shiftDurationMs / (1000 * 60 * 60);

      //Mettre à jour la balance des agents
      await Agent.findByIdAndUpdate(requesterId, { $inc: { balance: -shiftDurationHours } });
      await Agent.findByIdAndUpdate(agentId, { $inc: { balance: shiftDurationHours } });

      //Mettre à jour le shift avec le nouvel agent
      await Shift.findByIdAndUpdate(shiftId._id, {
        agentId: acceptingAgent._id,
        agentCode: acceptingAgent.code,
      });
    }

    //Mettre à jour la demande comme "Approved"
    request.status = "Approved";
    await request.save();

    //Archiver la demande dans l'historique
    await archiveToHistory(request, "Request Approved");

    //Supprimer la request après archivage
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
      message: `${requestType} validé et shift mis à jour.`,
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
