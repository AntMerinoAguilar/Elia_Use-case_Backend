const mongoose = require("mongoose");

//Model Agent

const agentSchema = new mongoose.Schema({
  profile_pic: String,
  name: { type: String, required: true },
  surname: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  code: { type: String, required: true },
  telephone: String,
  sector: String,
  balance: { type: Number, default: 0 },
  color: { type: String, default: "#000000" }, // Couleur associée à l'agent (par défaut noir pour éviter d'avoir une valeur undefined si aucune couleur n'est spécifiée)
  history: [
    {
      action: String,
      date: { type: Date, default: Date.now },
      details: String,
    },
  ],
});

const Agent = mongoose.model("Agent", agentSchema);

module.exports = Agent;
