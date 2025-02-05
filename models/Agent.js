const mongoose = require('mongoose');

//Model Agent

const agentSchema = new mongoose.Schema({
    profile_pic: String,
    name: {type: String, required: true},
    surname: {type: String, required: true},
    username: {type: String, required: true},
    password: {type: String, required: true},
    code: {type: String, required: true},
    telephone: String,
    sector: String,
    balance: { type: Number, default: 0 },
    history: [{
    action: String,
    date: { type: Date, default: Date.now },
    details: String
    }]
});
const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent;