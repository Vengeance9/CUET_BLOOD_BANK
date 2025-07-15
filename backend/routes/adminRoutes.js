const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');


router.get('/dashboard', protect, adminController.dashboardInfo);
router.post('/campaigns',protect,adminController.createCampaign);
router.delete('/campaigns/:id',protect,adminController.deleteCampaign);


  module.exports = router;