const express = require("express");
const router = express.Router();
const requireAuthMiddleware = require("../middlewares/authMiddleware");
const unavailabilityController = require("../controllers/unavailabilityController");

// Routes pour les indisponibilités
router.post('/', requireAuthMiddleware, unavailabilityController.createUnavailability);
router.get('/', requireAuthMiddleware, unavailabilityController.getAllUnavailabilities);
router.put('/:id', requireAuthMiddleware, unavailabilityController.updateUnavailabilityStatus);
router.delete('/:id', requireAuthMiddleware, unavailabilityController.deleteUnavailability);

module.exports = router;
