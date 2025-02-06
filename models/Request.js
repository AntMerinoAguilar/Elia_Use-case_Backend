const mongoose = require('mongoose');

//Model Demande

const requestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
  
  timeSlot: { //Créneau horaire souhaité (obligatoire)
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true }
  },

  availableSlots: [{ //Plages horaires proposées (obligatoire)
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true }
  }],

  requestType: { type: String, enum: ['Replacement', 'Swap'], required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  message: String,
  
  targetAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', default: null }
}, { timestamps: true });

const Request = mongoose.model('Request', requestSchema);

module.exports = Request