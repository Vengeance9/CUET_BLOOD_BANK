
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  createBloodRequest,
  getAllBloodRequests
} = require('../controllers/requestController');

router.post('/', protect, createBloodRequest);

router.get('/', protect, getAllBloodRequests); 

module.exports = router;