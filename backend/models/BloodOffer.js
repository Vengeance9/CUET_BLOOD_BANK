
const mongoose = require('mongoose');

const bloodOfferSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    city: {
      type: String,
      enum:['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Barisal', 'Rangpur'],
      default: null,
    },
    location: {
      type: String,
      default: '',
    },
    contactNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Rejected','Completed'],
      default: 'Pending',
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      default: null, 
    },
    appointmentTime: {
      type: Date,
      
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BloodOffer', bloodOfferSchema);