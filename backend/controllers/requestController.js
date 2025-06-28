
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');

exports.createBloodRequest = async (req, res) => {
  try {
    const userId = req.user.id;
   
    const { 
      bloodGroup,
      city,
      location,
      contactNumber,
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
      contactNumber,
      appointmentTime
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      data: newRequest,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getAllBloodRequests = async (req, res) => {
  try {

    const { city, bloodGroup } = req.query;

    let query = { status: 'Pending' };

    if (city) {
      query.city = city; 
    }
    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }
    const requests = await BloodRequest.find(query)
      .populate('user', 'firstName lastName') 
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

