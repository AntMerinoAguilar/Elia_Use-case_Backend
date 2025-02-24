const mongoose = require('mongoose');
const Request = require('./Request');  



const historySchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }, //Peut être un agent demandeur ou remplacé
  type: { type: String, enum: ['Unavailability', 'Request Approved', 'Urgent Replacement Accepted'], required: true }, //Type d'événement
  relatedId: { type: mongoose.Schema.Types.ObjectId, required: true }, //ID de la demande ou de l'indisponibilité
  details: { type: String }, //Description de l'événement
  startDate: { type: Date }, //Optionnel, utilisé si disponible
  endDate: { type: Date }, //Optionnel, utilisé si disponible
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }, //Optionnel, utilisé si c'est une request
  targetAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', default: null }, //Optionnel, utilisé si applicable
  status: { type: String }, //Optionnel, status de la request (Approved, Pending, etc.)
  requestType: { type: String, enum: ['Replacement', 'Swap', 'Urgent Replacement'] }, //Optionnel, utilisé si c'est une request
  dateArchived: { type: Date, default: Date.now } //Date d'archivage
});

const History = mongoose.model('History', historySchema);


module.exports = History
