
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const BloodOffer = require('../models/BloodOffer');

exports.createBloodRequest = async (req, res) => {
  try {
    const userId = req.user.id;
   
    const { 
      bloodGroup,
      city,
      location,
      contactNumber,
      reason,
      date,
      time
    } = req.body;

    if (!time || !date) {
      return res.status(400).json({ error: "Date and time are required." });
  }

    const [hours, minutes] = time.split(':').map(Number);
    const appointmentTime = new Date(date);
    appointmentTime.setHours(hours,minutes,0,0);  
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
  }
    
    const newRequest = new BloodRequest({
      user: userId,
      bloodGroup,
      city,
      location,
      reason,
      contactNumber,
      appointmentTime
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      data: newRequest,
      id: newRequest._id,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getAllBloodRequests = async (req, res) => {
  try {

    const { city, bloodGroup } = req.query;
    const userId = req.user.id;

    let query = { 
      status: 'Pending' ,
      user:{$ne: req.user.id} 
    };

    if (city) {
      query.city = city; 
    }
    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    const userOfferedRequests = await BloodOffer.find({ user: userId })
      .distinct('requestId');

    const confirmedOfferedRequests = await BloodOffer.find({
      user: userId,
      status: 'Confirmed'
    }).distinct('requestId');
    
    query._id = { $nin: confirmedOfferedRequests };

    const requests = await BloodRequest.find(query)
      .populate('user', 'firstName lastName') 
      .sort({ createdAt: -1 });

    
      
      

    res.status(200).json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

