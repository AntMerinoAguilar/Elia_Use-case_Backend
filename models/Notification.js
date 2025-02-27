const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' /* required: true */ },
    type: { type: String, enum: ['Swap Request', 'Replacement Request', 'Unavailability Signaled', 'Status Update', 'Urgent Replacement Available', 'Urgent Replacement Confirmation'], required: true },
    message: String,
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});


const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification