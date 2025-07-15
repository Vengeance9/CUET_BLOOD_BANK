const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    title:{
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        trim: true,
    },
    appointmentTime: {
        type: Date,
        required: true,
    },
    expectedDonors: {
        type: Number,
    },
    description: {
        type: String,
        trim: true,
    },
    registeredUsers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        }
      ]

})

module.exports = mongoose.model('Campaign', campaignSchema);