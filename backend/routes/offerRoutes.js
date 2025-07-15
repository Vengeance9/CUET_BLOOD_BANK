const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllBloodOffers,
  createBloodOffer,
  getOffersByRequestId,
  acceptDonor,
  getUpcomingDonationAppointments,
  cancelDonationAppointment,
  getrequestIds
} = require('../controllers/offerController');

router.get('/', protect, getAllBloodOffers);
router.post('/donate',protect,createBloodOffer)
router.get('/request', protect, getOffersByRequestId);
router.post('/accept', protect, acceptDonor);
router.get('/get',protect, getrequestIds)
router.get('/my/appointments', protect, getUpcomingDonationAppointments);
router.put('/:id/cancel', protect, cancelDonationAppointment);
router.get('/myOffers', protect, getrequestIds);

module.exports = router;