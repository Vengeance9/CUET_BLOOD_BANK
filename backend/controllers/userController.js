// controllers/userController.js
const User = require('../models/User');
const BloodOffer = require('../models/BloodOffer');
const BloodRequest = require('../models/BloodRequest');
const Campaign = require('../models/Campaign');
const chalk= require('chalk');
const fs = require('fs');



exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(req.user.id)

    const user = await User.findById(userId).select('-password');

    const requestCount = await BloodRequest.countDocuments({ user: userId });


    const allRequests = await BloodRequest.find({ user: userId }).lean();
    const allOffers = await BloodOffer.find({ user: userId }).populate('requestId','reason').lean();

    const activities = [
        ...allRequests.map(req => ({
          type: 'request',
          bloodGroup: req.bloodGroup,
          city: req.city,
          location: req.location,
          time: req.appointmentTime || req.createdAt,
          status: req.status,
          reason: req.reason,
          appointmentTime: req.appointmentTime,
        })),
        ...allOffers.map(offer => ({
          type: 'donation',
          bloodGroup: offer.bloodGroup,
          city: offer.city,
          location: offer.location,
          time: offer.appointmentTime || offer.createdAt,
          status: offer.status,
          requestId: offer.requestId,
          reason: offer.requestId ? offer.requestId.reason : null,
          appointmentTime: offer.appointmentTime,
        })),
      ];

    activities.sort((a, b) => new Date(b.time) - new Date(a.time));


    

    // Upcoming appointments
    const upcomingDonations = await BloodOffer.find({
      user: userId,
      status: 'Confirmed',
    });

    const upcomingRequests = await BloodRequest.find({
      user: userId,
      status: 'Pending',
    });

    const upcomingAppointments = [...upcomingDonations, ...upcomingRequests];

    // // Lives saved (assumed one life per completed donation)
    // const livesSaved = donationCount;
    console.log(user.firstName)
    console.log(chalk.blueBright.bold(user.lastDonated));

    console.log(chalk.blueBright.bold('SENDING USER DATA'));
    res.status(200).json({
      success: true,
      message: 'User data fetched successfully',
      data: {
        user,
        upcomingAppointments,
        requestCount,
        activities,
      },
    });
  } catch (err) {
    console.error(chalk.red('COULD NOT SEND USER DATA'));
    res.status(500).send('Server error');
  }
};

exports.updateUserAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarPath },
      { new: true }
    );

    res.json({
      message: 'Avatar updated',
      data: {
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getDonorData = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user.id;
    const donor = await User.find({isDonor:true, _id: { $ne: userId }}).select('-password')
    .skip(skip)
    .limit(parseInt(limit));

    const total = await User.countDocuments({ isDonor: true });

    donor.forEach((donor) => {
      console.log('NAME:'+ donor.firstName + ' ' + donor.lastName);
    })

   

    res.status(200).json({
      success: true,
      data: donor,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalDonors: total
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Failed to fetch all donors information');
  }
};

exports.donorRegistration = async (req, res) => {
  try{
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, { isDonor: true }, { new: true });
    res.status(200).json({message: 'Donor registration successful'});
  }catch(err){
    console.error(err.message);
    res.status(500).send('Server error');
  }
}

exports.campaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      data: campaigns

    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Failed to fetch campaigns');
  }
}

exports.campaignRegistration = async(req,res)=>{
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const campaign = await Campaign.findById(id);

    if (campaign.registeredUsers.includes(userId)) {
      return res.status(400).json({ message: 'You are already registered for this campaign' });
    }

    campaign.registeredUsers.push(userId);

    await campaign.save();

    res.status(201).json({
      success: true,
      message: 'Registered successfully',
      data: campaign,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}