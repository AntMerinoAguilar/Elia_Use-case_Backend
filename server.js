const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Pour charger le .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connecté"))
  .catch(err => console.error(err));

// Exemple route de test
app.get("/", (req, res) => {
  res.send("API en ligne");
});

// Démarrer le serveur
app.listen(PORT, () => console.log(`Serveur lancé sur le port : ${PORT}`));