const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Agent = require("../models/Agent");

// Connexion à l'application
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Vérification que tous les champs sont fournis
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Veuillez fournir un username et un mot de passe" });
    }

    // Vérifier si l'agent existe
    const agent = await Agent.findOne({ username });
    if (!agent) {
      return res
        .status(404)
        .json({ message: `L'agent "${username}" est introuvable` });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: agent._id, username: agent.username },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    // Stocker le token dans un cookie sécurisé
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None", // Permet l'accès entre différents ports (5173 → 3000)
      domain: ".vercel.app",  // Spécifie que le cookie appartient à localhost ou domain
      /* path: "/", */ // Rend le cookie accessible sur toutes les routes
      maxAge: 10 * 24 * 60 * 60 * 1000, // 10 jours
    });

    // Réponse de succès
    res.status(200).json({ message: "Connexion réussie" });
  } catch (err) {
    console.error("Erreur lors de la connexion :", err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

// Déconnexion de l'application
const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true, // ⚠️ Mettre `true` en production
      sameSite: "None",
      /* path: "/" */
      domain: "vercel.app"
    });
    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (err) {
    console.error("Erreur lors de la déconnexion :", err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

module.exports = {
  login,
  logout
};
