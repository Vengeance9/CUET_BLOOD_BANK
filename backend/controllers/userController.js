// controllers/userController.js
const User = require('../models/User');
const BloodOffer = require('../models/BloodOffer');
const BloodRequest = require('../models/BloodRequest');
const chalk= require('chalk');
const fs = require('fs');



exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(req.user.id)

    const user = await User.findById(userId).select('-password');

    // const donationCount = await BloodOffer.countDocuments({
    //   user: userId,
    //   status: 'Completed',
    // });

    // const lastDonation = await BloodOffer.findOne({
    //   user: userId,
    //   status: 'Completed',
    // }).sort({ updatedAt: -1 });

    // const recentOffers = await BloodOffer.find({ user: userId })
    //   .sort({ createdAt: -1 })
    //   .limit(5);

    // const recentRequests = await BloodRequest.find({ user: userId })
    //   .sort({ createdAt: -1 })
    //   .limit(5);

    // const recentActivity = [...recentOffers, ...recentRequests].sort(
    //   (a, b) => b.createdAt - a.createdAt
    // );

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

    console.log(chalk.blueBright.bold('SENDING USER DATA'));
    res.status(200).json({
      success: true,
      message: 'User data fetched successfully',
      data: {
        user:{
          firstName: user.firstName,
          donationCount: user.donationCount,
        },
        upcomingAppointments,
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