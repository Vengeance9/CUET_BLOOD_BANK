// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDashboardData, getDonorData, donorRegistration, campaigns,campaignRegistration } = require('../controllers/userController');

router.get('/', protect, getDashboardData);
router.get('/donors', protect, getDonorData);
router.put('/donorReg',protect, donorRegistration);
router.get('/allcampaigns',campaigns)
router.post('/register/:id', protect, campaignRegistration);

module.exports = router;