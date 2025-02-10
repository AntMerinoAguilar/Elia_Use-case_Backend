const jwt = require("jsonwebtoken");

const requireAuthMiddleware = (req, res, next) => {
  // Récupérer le token à partir des cookies
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Accès refusé. Token manquant." });
  }

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.agent = decoded; // Stocker les infos de l'agent décodé dans la requête
    next();
  } catch (err) {
    res.status(400).json({ message: "Token invalide ou expiré." });
  }
};

module.exports = requireAuthMiddleware;
