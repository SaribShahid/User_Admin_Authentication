const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  refreshToken: {
    type: String,
    default: null
  },
    isVerified: { 
      type: Boolean, default: false 
    },
 verificationToken: { 
  type: String 
},
 resetPasswordToken:{
  type: Boolean
 },
 resetPasswordToken:{
  type: String
},
 resetPasswordExpire:{
  type: Date
},
 otp: { 
  type: String 
},
 otpExpires: { 
  type: Date 
}
});

module.exports = mongoose.model('User', userSchema);
