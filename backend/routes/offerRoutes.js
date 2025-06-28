const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllBloodOffers,
  createBloodOffer,
  getOffersByRequestId,
  acceptDonor,
  getUpcomingDonationAppointments,
  cancelDonationAppointment
} = require('../controllers/offerController');

router.get('/', protect, getAllBloodOffers);
router.post('/',protect,createBloodOffer)
router.get('/request', protect, getOffersByRequestId);
router.post('/accept', protect, acceptDonor);
router.get('/my/appointments', protect, getUpcomingDonationAppointments);
router.put('/:id/cancel', protect, cancelDonationAppointment);

module.exports = router;