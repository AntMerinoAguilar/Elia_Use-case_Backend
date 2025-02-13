
require('dotenv').config(); 

const mongoose = require('mongoose');
const Agent = require('../models/Agent');
const Shift = require('../models/Shift');

async function populateCalendar() {
    try {
        
        // Vérifier si l'URI est bien définie
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI est undefined !");
        }

        await mongoose.connect(process.env.MONGO_URI);

        // Récupérer tous les agents triés
        const agents = await Agent.find().sort({ _id: 1 });

        if (agents.length === 0) {
            return;
        }

        // Débuter au 1er janvier 2026 à 07:30
        let startDate = new Date("2026-01-01T07:30:00Z");

        const shiftsToInsert = [];

        // Générer les shifts pour 52 semaines
        for (let week = 0; week < 52; week++) {
            const agentIndex = week % agents.length;
            const agent = agents[agentIndex];

            // Calculer la fin du shift exactement 7 jours après le début (sans battement)
            let endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7); // 7 jours complets
            endDate.setHours(7, 30, 0, 0); // Assurer que l'heure reste 07:30

            const shift = {
                agentId: agent._id,
                agentCode: agent.code,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: 'Assigned',
                replacements: []
            };

            shiftsToInsert.push(shift);

            // Mettre à jour le début du prochain shift pour qu'il commence immédiatement après le précédent
            startDate = new Date(endDate);
        }

        await Shift.insertMany(shiftsToInsert);
        

        mongoose.connection.close();
    } catch (error) {
        mongoose.connection.close();
    }
}

// Exécuter le script
populateCalendar();
