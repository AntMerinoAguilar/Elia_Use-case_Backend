const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Importer cookie-parser

// Importer les routes via le fichier routes/index.js
const routes = require("./routes/index");

// Pour charger le .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
const corsOptions = {
    origin: ["http://localhost:5173", "https://eduty-groupe2.vercel.app"], 
    methods: "GET,POST,DELETE,PUT,PATCH",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,  // Ajout pour autoriser les cookies/sessions
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Ajouter cookie-parser ici

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
/* Vercel */
if (process.env.NODE_ENV === "development") {
  app.listen(PORT, () => console.log(`Serveur lancé sur port${PORT}`));
} 

