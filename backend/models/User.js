// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
   bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood group is required'],
   },
   isDonor:{
    type: Boolean,
    default: false,
   },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    donationCount: {
      type: Number,
      default: 0,
    },
    lastDonated:{
      Type:Date,
    },
    

  },
  {
    timestamps: true,
  }
);



module.exports = mongoose.model('User', userSchema);