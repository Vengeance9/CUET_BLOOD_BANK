const BloodOffer = require('../models/BloodOffer');
const User = require('../models/User');
const chalk = require('chalk');
const mongoose = require('mongoose');
const BloodRequest = require('../models/BloodRequest');

exports.getAllBloodOffers = async (req, res) => {
    try {
      const { requestId } = req.query;
  
      let query = { status: 'Pending' };
  
      if (requestId) {
        query.requestId = new mongoose.Types.ObjectId(requestId);
      }
  
      const offers = await BloodOffer.find(query)
        .populate('user', 'firstName lastName')
        .sort({ createdAt: -1 });
  
      res.status(200).json(offers);
    } catch (err) {
      console.error(err.message);
      res.status(500)
    }
  };

  exports.createBloodOffer = async (req, res) => {
    const userId = req.user.id;
    const { bloodGroup, city, location, contactNumber, requestId } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User pawa jainai' });
      }

      const newOffer = new BloodOffer({
        user: userId,
        bloodGroup,
        city,
        location,
        contactNumber,
        requestId: requestId ? new mongoose.Types.ObjectId(requestId) : null,
      });
      console.log(chalk.green.bold('requestId: ' + requestId));

      await newOffer.save();

      res.status(201).json({
        success: true,
        data: newOffer,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Ekhane error hoyeche' });
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
      res.status(500).json({ message: 'Server e error hoyeche' });
    }
  };

  exports.getrequestIds = async (req, res) => {
    try{
      const userId = req.user.id;

      const offers = await BloodOffer.find({ user: userId, status: 'Pending' });

      return res.status(200).json(offers)
      
    }catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server e error hoyeche' });
    }
  }

 
exports.acceptDonor = async (req, res) => {
  try {
    const { requestId, offerId } = req.body;
    const userId = req.user.id;

    console.log(chalk.blue.bold('Request ID: ' + requestId));
    console.log(chalk.blue.bold('Offer ID: ' + offerId));

    const request = await BloodRequest.findById(requestId);

    if (!request || request.user.toString() !== userId) {
      return res.status(404).json({ message: 'Request not found or unauthorized' });
    }

    const offer = await BloodOffer.findById(offerId);
    if (!offer || offer.requestId.toString() !== requestId) {
      return res.status(404).json({ message: 'Offer not found for this request' });
    }

  
    offer.status = 'Confirmed';
   

    offer.appointmentTime = request.appointmentTime;

    await offer.save();

    console.log(chalk.green.bold('Offer appointment time set to: ' + offer.appointmentTime));
    console.log('Donor accepted successfully');

    res.json({
      message: 'Donor accepted successfully',
      request,
      offer
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUpcomingDonationAppointments = async (req, res) => {
  console.log(chalk.green.bold('GETTING UPCOMING APPOINTMENTS FOR USER'));
  try {
    const userId = req.user.id;

    const appointments = await BloodOffer.find({
      user: userId,
      $and: [
        { status: { $in: ['Confirmed', 'Pending'] } },
        { status: { $ne: 'Cancelled' } }
      ]
    }).select('status updatedAt user requestId')
      .populate('user', 'firstName donationCount lastDonated')
      .populate('requestId', 'appointmentTime') 
      ;

      console.log(chalk.green.bold('SENDING UPCOMING APPOINTMENTS DATA'));
      // console.log(appointments.user.lastDonated);

      for(const appointment of appointments) {
        console.log(`requestId: ${appointment.requestId ? appointment.requestId._id : 'N/A'}`);
        const request = await BloodRequest.findById(appointment.requestId);
        const time = request ? request.appointmentTime : null;

        appointment.appointmentTime = time ? time.toISOString() : null;
        appointment.location = request ? request.location : 'N/A';

        console.log(chalk.blue.bold(`Appointment Time: ${appointment.appointmentTime}`));


      }

      

    res.status(200).json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
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
    res.status(500).json({ message: 'Server error' });
  }
};