const BloodOffer = require('../models/BloodOffer');
const User = require('../models/User');
const chalk = require('chalk');

exports.getAllBloodOffers = async (req, res) => {
    try {
      const { requestId } = req.query;
  
      let query = { status: 'Pending' };
  
      if (requestId) {
        query.requestId = mongoose.Types.ObjectId(requestId);
      }
  
      const offers = await BloodOffer.find(query)
        .populate('user', 'firstName lastName')
        .sort({ createdAt: -1 });
  
      res.status(200).json(offers);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };

  exports.createBloodOffer = async (req, res) => {
    const userId = req.user.id;
    const { bloodGroup, city, location, contactNumber, requestId } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const newOffer = new BloodOffer({
        user: userId,
        bloodGroup,
        city,
        location,
        contactNumber,
        requestId: requestId ? mongoose.Types.ObjectId(requestId) : null,
      });

      await newOffer.save();

      res.status(201).json({
        success: true,
        data: newOffer,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }

  exports.getOffersByRequestId = async (req, res) => {
    try {
      const { requestId } = req.query;
  
      if (!requestId) {
        return res.status(400).json({ message: 'Request ID is required' });
      }
  
      const offers = await BloodOffer.find({
        requestId,
        status: 'Pending'
      })
        .populate('user', 'firstName lastName phone')
        .select('-__v');
  
      res.status(200).json(offers);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };

 
exports.acceptDonor = async (req, res) => {
  try {
    const { requestId, offerId } = req.body;
    const userId = req.user.id;

    const request = await BloodRequest.findById(requestId);

    if (!request || request.user.toString() !== userId) {
      return res.status(404).json({ message: 'Request not found or unauthorized' });
    }

    const offer = await BloodOffer.findById(offerId);
    if (!offer || offer.requestId.toString() !== requestId) {
      return res.status(404).json({ message: 'Offer not found for this request' });
    }

    request.status = 'Fulfilled';
    await request.save();

    offer.status = 'Confirmed';
    await offer.save();

    request.appointmentTime = offer.appointmentTime;

    res.json({
      message: 'Donor accepted successfully',
      request,
      offer
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getUpcomingDonationAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    const appointments = await BloodOffer.find({
      user: userId,
      status: { $in: ['Confirmed', 'Pending'] },
      status:{$ne:'Cancelled'}
    }).select('location status updatedAt appointmentTime user')
      .populate('user', 'firstName donationCount lastDonated');

      console.log(chalk.green.bold('SENDING UPCOMING APPOINTMENTS DATA'));

    res.status(200).json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.cancelDonationAppointment = async (req, res) => {
  try {
    const offerId = req.params.id;
    const userId = req.user.id;

    const offer = await BloodOffer.findById(offerId);

    if (!offer || offer.user.toString() !== userId) {
      return res.status(404).json({ message: 'Offer not found or unauthorized' });
    }

    offer.status = 'Cancelled';
    await offer.save();

    if(offer.requestId) {
      const request = await BloodRequest.findById(offer.requestId);
      if (request) {
        request.status = 'Pending'; 
        await request.save();
      }
    }

    res.json({ message: 'Appointment cancelled successfully', offer });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};