const Agent = require("../models/Agent");
const bcrypt = require("bcryptjs");

// Récupérer tous les agents
const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find();
    res.status(200).json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer les informations de l'agent connecté
const getCurrentAgent = async (req, res) => {
  try {
    const agentId = req.agent.id; // Récupéré depuis le token JWT via le middleware
    const agent = await Agent.findById(agentId).select("-password"); // Exclure le mot de passe

    if (!agent) {
      return res.status(404).json({ message: "Agent non trouvé" });
    }

    res.status(200).json(agent);
  } catch (err) {
    console.error("Erreur lors de la récupération de l'agent connecté :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer un agent par ID
const getAgentById = async (req, res) => {
  try {
    const id = req.params.id;
    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({ message: `Agent ${id} non trouvé` });
    }
    res.status(200).json(agent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Ajouter un nouvel agent
const createAgent = async (req, res) => {
  try {
    if (!req.body.password) {
      return res.status(400).json({ message: "Le mot de passe est requis" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const newAgent = new Agent({
      ...req.body,
      password: hashedPassword,
    });

    await newAgent.save();
    res.status(201).json(newAgent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Mettre à jour un agent
const updateAgent = async (req, res) => {
  try {
    const id = req.params.id;
    let updateData = { ...req.body };

    if (updateData.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    const updatedAgent = await Agent.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedAgent) {
      return res.status(404).json({ message: `Agent ${id} non trouvé` });
    }

    res.status(200).json(updatedAgent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Supprimer un agent
const deleteAgent = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedAgent = await Agent.findByIdAndDelete(id);
    if (!deletedAgent) {
      return res.status(404).json({ message: `Agent ${id} non trouvé` });
    }
    res.status(200).json({ message: `Agent ${id} supprimé avec succès` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllAgents,
  getCurrentAgent,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
};
