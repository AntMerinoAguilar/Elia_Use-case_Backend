const express = require("express");
const router = express.Router();
const Agent = require("../models/Agent");
const requireAuthMiddleware = require("../middlewares/authMiddleware");
const bcrypt = require('bcryptjs')

// Route pour récupérer tous les agents
router.get("/", requireAuthMiddleware, async (req, res) => {
  try {
    const agents = await Agent.find();
    res.status(200).json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route pour récupérer un agent par ID
router.get("/:id", requireAuthMiddleware, async (req, res) => {
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
});

// Route pour ajouter un nouvel agent
router.post("/", requireAuthMiddleware, async (req, res) => {
  try {
    
    // Vérifier si un mot de passe est fourni
    if (!req.body.password) {
      return res.status(400).json({ message: "Le mot de passe est requis" });
    }

    // Hasher le mot de passe avant de l'enregistrer
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Créer un nouvel agent avec le mot de passe hashé
    const newAgent = new Agent({
      ...req.body,
      password: hashedPassword,
    });

    // Sauvegarder dans la base de données
    await newAgent.save();

    res.status(201).json(newAgent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Route pour mettre à jour un agent

router.put("/:id", requireAuthMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    let updateData = { ...req.body };

    // Vérifier si un mot de passe est fourni pour le mettre à jour avec un hash sécurisé
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
});


// Route pour supprimer un agent
router.delete("/:id", requireAuthMiddleware, async (req, res) => {
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
});

module.exports = router;
