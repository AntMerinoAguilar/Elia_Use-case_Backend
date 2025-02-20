const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Route pour la connexion
router.post("/login", authController.login);

// route get test

router.get("/login", (req, res) => {

    let token = "qlmskdjf"
    res.status(200).cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None", // Permet l'accès entre différents ports (5173 → 3000)
      domain: ".vercel.app",  // Spécifie que le cookie appartient à localhost ou domain
      /* path: "/", */ // Rend le cookie accessible sur toutes les routes
      maxAge: 10 * 24 * 60 * 60 * 1000, // 10 jours
    });
})

// Route pour la déconnexion
router.post("/logout", authController.logout);

module.exports = router;
