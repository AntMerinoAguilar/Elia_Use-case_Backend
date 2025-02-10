const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Agent = require("../models/Agent");
const router = express.Router();

// Route pour la connexion
router.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    // Vérifier si l'agent existe dans la DB
    const agent = await Agent.findOne({ username: username });
    if (!agent) {
      return res.status(404).json({ message: `Agent : ${username}, non trouvé` });
    }

    // Comparer le mot de passe  avec celui stocké dans la DB
    const isMatch = await Agent.findOne({ password:password})  /* await bcrypt.compare(password, agent.password); */
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    } 

    // Générer un token JWT pour l'agent
    const token = jwt.sign(
      { id: agent._id, username: agent.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Renvoyer le token dans la réponse
    res.status(200).json({
      message: "Connexion réussie",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur du serveur" });
  }
});

module.exports = router;
