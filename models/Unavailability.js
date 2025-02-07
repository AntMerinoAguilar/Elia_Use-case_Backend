const mongoose = require('mongoose');

//Model indisponibilités

const unavailabilitySchema = new mongoose.Schema({
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
    type: { type: String, enum: ['Holiday', 'Urgent'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    relatedShiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
    replacementRequested: { type: Boolean, default: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

const Unavailability = mongoose.model('Unavailability', unavailabilitySchema);

module.exports = Unavailability;