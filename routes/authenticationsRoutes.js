const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Route pour la connexion
router.post("/login", authController.login);


// Route pour la déconnexion
router.post("/logout", authController.logout);

module.exports = router;
