const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

//Imports des models
const Agent = require('./models/Agent');
const Shift = require('./models/Shift');
const Unavailability = require('./models/Unavailability');
const Request = require('./models/Request');

// Importer les routes via le fichier routes/index.js
const routes = require("./routes");



// Pour charger le .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
    origin: ["http://localhost:5173", "https://eDutygroupe2.vercel.app"], 
    methods: "GET,POST,DELETE,PUT,PATCH",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,  // ✅ Ajout pour autoriser les cookies/sessions
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecté"))
  .catch(err => console.error(err));

// Exemple route de test
app.get("/", (req, res) => {
  res.send("API en ligne");
});

// Utilisation du Router
app.use('/api', routes);

// Démarrer le serveur
app.listen(PORT, () => console.log(`Serveur lancé sur le port : ${PORT}`));




