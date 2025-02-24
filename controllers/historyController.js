const History = require("../models/History");

//Fonction pour ajouter une requête ou une indisponibilité dans History
async function archiveToHistory(document, type) {
  try {
    //Filtrer les champs pour ne copier que ceux qui existent
    const historyData = {
      type,
      relatedId: document._id,
      dateArchived: new Date(),
      details: document.details || "", // Ajoute une description si existante
    };

    // Ajouter les champs uniquement s'ils existent dans le document original
    if (document.agentId) historyData.agentId = document.agentId;
    if (document.startDate) historyData.startDate = document.startDate;
    if (document.endDate) historyData.endDate = document.endDate;
    if (document.requesterId) historyData.requesterId = document.requesterId;
    if (document.targetAgentId)
      historyData.targetAgentId = document.targetAgentId;
    if (document.status) historyData.status = document.status;
    if (document.requestType) historyData.requestType = document.requestType;

    const archivedEntry = new History(historyData);
    await archivedEntry.save();
    
  } catch (err) {
    console.error("Erreur lors de l'archivage dans History :", err);
  }
}

  const getHistory = async (req, res) => {
  try {
    const history = await History.find();
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getHistoryByAgent = async (req, res) => {
 

  try {
    const agentId = req.params.id;
   

    //Récupérer l'historique où l'agent est demandeur OU cible
    const history = await History.find({
      $or: [{ requesterId: agentId }, { targetAgentId: agentId }]
    }).sort({ dateArchived: -1 }); // Trie du plus récent au plus ancien

   

    if (!history.length) {
      return res.status(404).json({ message: `Aucun historique trouvé pour l'agent ${agentId}` });
    }

    res.status(200).json(history); //Envoie la réponse JSON avec les données
  } catch (err) {
    console.error("Erreur lors de la récupération de l'historique :", err);
    res.status(500).json({ message: err.message });
  }
};


module.exports = {archiveToHistory, getHistory, getHistoryByAgent};


