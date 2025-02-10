const History = require('../models/History');  

//Fonction pour ajouter une requête ou une indisponibilité dans History
async function archiveToHistory(document, type) {
  try {
    // 🏆 Filtrer les champs pour ne copier que ceux qui existent
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
    if (document.targetAgentId) historyData.targetAgentId = document.targetAgentId;
    if (document.status) historyData.status = document.status;
    if (document.requestType) historyData.requestType = document.requestType;

    const archivedEntry = new History(historyData);
    await archivedEntry.save();
    console.log(`${type} archivée dans History !`);
  } catch (err) {
    console.error("Erreur lors de l'archivage dans History :", err);
  }
}

module.exports = {archiveToHistory};