const express = require('express');
const router = express.Router();
const requireAuthMiddleware = require("../middlewares/authMiddleware");
const requestController = require('../controllers/requestController');

// Routes pour les requêtes
router.get("/",requireAuthMiddleware, requestController.getRequests);
router.get("/me", requireAuthMiddleware, requestController.getMyRequests);
router.get("/:agentId",requireAuthMiddleware, requestController.getRequestsByAgent);
router.post('/', requireAuthMiddleware, requestController.createRequest);
router.put('/:id/accept', requireAuthMiddleware, requestController.acceptRequest);
router.delete("/:id/cancel", requireAuthMiddleware, requestController.cancelRequest);


module.exports = router;
