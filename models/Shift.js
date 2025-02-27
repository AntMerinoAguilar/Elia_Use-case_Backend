const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    agentCode: {type: String, required: true},
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['Assigned', 'Partially Replaced', 'Fully Replaced','Available'], default: 'Assigned' },
    replacements: [{
        replacementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
        startTime: Date,
        endTime: Date,
        status: { type: String, enum: ['Pending', 'Confirmed', 'Rejected',], default: 'Pending' }
    }]
}, { timestamps: true });

shiftSchema.pre("find", function (next) {
  this.sort({ startDate: -1 });
  next();
});

const Shift = mongoose.model('Shift', shiftSchema);

module.exports = Shift;