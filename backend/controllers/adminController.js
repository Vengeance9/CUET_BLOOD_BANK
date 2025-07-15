const BloodOffer = require('../models/BloodOffer');
const User = require('../models/User');
const chalk = require('chalk');
const mongoose = require('mongoose');
const BloodRequest = require('../models/BloodRequest');
const Campaign = require('../models/Campaign');


exports.dashboardInfo = async (req, res) => {
    console.log('DASHBOARD ROUTE HIT')
    try{

     
    const usercount = await User.countDocuments();
    const offerCount = await BloodOffer.countDocuments();
    const requestCount = await BloodRequest.countDocuments();
    const pendingrequestCount = await BloodRequest.countDocuments({ status: 'Pending' });
    const FulfilledrequestCount = await BloodRequest.countDocuments({ status: 'Fulfilled' });

    const requests = await BloodRequest.find().populate('user', 'firstName lastName').sort({ createdAt: -1 })
    

    const campaigns = await Campaign.find().populate('user', 'firstName lastName').sort({ createdAt: -1 });

    const users = await User.find().select('-password').sort({ createdAt: -1 })

    const offers = await BloodOffer.find().populate('user', 'firstName lastName').sort({ createdAt: -1 });

    console.log(chalk.green('Dashboard data fetched successfully'));

    console.log(chalk.blue(`Total Users: ${usercount}`));

    console.log(chalk.blue(`Total Offers: ${offerCount}`));

    users.slice(0,5).forEach(user => {
        console.log(chalk.blue(`User: ${user.firstName} ${user.lastName}`));
    });
    
    console.log('Data pathano hoise admin ke')
    res.status(200).json({
        success: true,
        message: 'Dashboard data fetched successfully',
        data: {
            userCount: usercount,
            offerCount: offerCount,
            requestCount: requestCount,
            pendingRequestCount: pendingrequestCount,
            fulfilledRequestCount: FulfilledrequestCount,
            requests: requests,
            users:users,
            offers: offers,
            campaigns: campaigns,
            

        }
    });
}catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
}


exports.createCampaign = async (req, res) => {
    console.log('CREATE CAMPAIGN ROUTE HIT')
    const { title,date,time,location,description } = req.body;

    if (!location) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const [hours, minutes] = time.split(':').map(Number);
    const appointmentTime = new Date(date);
    appointmentTime.setHours(hours,minutes,0,0); 

    try {
        const campaign = new Campaign({
            user: req.user.id,
            location,
            appointmentTime,
            title,
            description
        });

        await campaign.save();

        res.status(201).json({
            success: true,
            message: 'Campaign created successfully',
            data: campaign
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
}

// exports.getCampaigns = async (req, res) => {
//     try {
//         const campaigns = await Campaign.find().populate('user', 'firstName lastName').sort({ createdAt: -1 });

//         if (!campaigns || campaigns.length === 0) {
//             return res.status(404).json({ message: 'No campaigns found' });
//         }

//         res.status(200).json({
//             success: true,
//             message: 'Campaigns fetched successfully',
//             data: campaigns
//         });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json({ message: 'Server error' });
//     }
// }

exports.deleteCampaign = async (req, res) => {
    console.log('DELETE CAMPAIGN ROUTE HIT')
    try{
        const { id } = req.params;
        console.log('Campaign ID to delete:', id);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log('Invalid campaign ID:', id);
            return res.status(400).json({ message: 'Invalid campaign ID' });
        }

        const campaign = await Campaign.findById(id);

        if (!campaign) {
            return res.status(504).json({ message: 'Campaign not found' });
        }

       

        await Campaign.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Campaign deleted successfully'
        });

    }catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
}
