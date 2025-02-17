const jwt = require("jsonwebtoken");
const Agent = require("../models/Agent");

const requireAuthMiddleware = async (req, res, next) => {
  // Récupérer le token à partir des cookies
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Accès refusé. Token manquant." });
  }

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'agent complet depuis la base de données
    const agent = await Agent.findById(decoded.id).select("-password"); // Exclut le mot de passe

    if (!agent) {
      return res.status(404).json({ message: "Agent non trouvé." });
    }

    req.agent = agent; // Attacher l'agent complet à la requête
    next();
  } catch (err) {
    res.status(400).json({ message: "Token invalide ou expiré." });
  }
};

module.exports = requireAuthMiddleware;
