const mongoose = require('mongoose');

//Model Shifts

const shiftSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  agentCode: {type: String, required: true},
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['Assigned', 'Partially Replaced', 'Fully Replaced'], default: 'Assigned' },
  replacements: [{
    replacementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    startTime: Date,
    endTime: Date,
    status: { type: String, enum: ['Pending', 'Confirmed', 'Rejected'], default: 'Pending' }
  }]
}, { timestamps: true });

const Shift = mongoose.model('Shift', shiftSchema);

module.exports = Shift;