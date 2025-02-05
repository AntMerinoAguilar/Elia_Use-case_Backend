const mongoose = require('mongoose');

//Model Demande

const requestSchema = new mongoose.Schema({
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
    timeSlot: {
    startTime: Date,
    endTime: Date
    },
    requestType: { type: String, enum: ['Replacement', 'Swap'], required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    message: String,
  targetAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', default: null } // Ciblage optionnel
}, { timestamps: true });

const Request = mongoose.model('Request', requestSchema);

module.exports = Request