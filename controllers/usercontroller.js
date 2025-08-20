require('dotenv').config();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const logActivity=require('../utils/logActivity');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const jwt = require('jsonwebtoken');
const register = async (req, res) => {
  try {
    const { username, email, password, role, key } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    if(role==='admin'&&key!== process.env.ADMIN_SECRET)
      return res.status(400).json({ message: 'Incoorect Key' });
    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString('hex'); 

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      verificationToken
    });
    const verifyURL = `${process.env.BASE_URL}/verify/${verificationToken}`;

    await sendEmail(
      email,
      'Verify your email',
      `<p>Click here to verify: <a href="${verifyURL}">${verifyURL}</a></p>`
    );
    await logActivity(user._id, 'User Registered', req);
    res.status(201).json({ message: `Registered as ${user.role}, please verify your email` });
  } catch (err) {
    res.status(400).json({ message: 'Registration failed', error: err.message });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });
    if(!user.isVerified) return res.status(400).json({message : "Please Verify your email" })
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();
    await logActivity(user._id, 'User Logined', req);
    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};


const token = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(403).json({ message: 'Refresh token is missing' });
  }

  const user = await User.findOne({ refreshToken });
  if (!user) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }

  const jwt = require('jsonwebtoken');

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token verification failed' });

    const newAccessToken = generateAccessToken(decoded);
    res.json({ accessToken: newAccessToken });
  });
};


const logout = async (req, res) => {
  const { refreshToken } = req.body;

  const user = await User.findOne({ refreshToken });
  if (!user) return res.status(400).json({ message: 'Invalid token' });

  user.refreshToken = null;
  await user.save();
  await logActivity(user._id, 'User Logout', req);
  res.json({ message: 'Logged out successfully' });
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();
    await logActivity(user._id, 'User Profile updated', req);

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    await user.save();
    await logActivity(user._id, 'User updated Password', req);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating password', error: err.message });
  }
};

const verifyEmail = async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
};

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; 
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail(
        email,
        'Password Reset Request',
        `<p>Click here to reset: <a href="${resetURL}">${resetURL}</a></p>`
    );

    res.json({ message: 'Reset link sent to your email.' });
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    await logActivity(user._id, 'User Reset Password', req);
    res.json({ message: 'Password reset successful' });
};
const googleCallback = async (req, res) => {
  try {
    const user = req.user;  
    if (!user) {
      return res.status(401).json({ message: 'Google login failed' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Google login successful',
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken
    });
    await logActivity(user._id, 'User Login via Google', req);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const socailLogout = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Not authenticated' });

    user.refreshToken = null;
    await user.save();

    req.logout(); 
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
};
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendEmail(
      email,
      'Your OTP Code',
      `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`
    );

    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending OTP', error: err.message });
  }
};
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
    await logActivity(user._id, 'User Login via OTP', req);
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying OTP', error: err.message });
  }
};

module.exports = { register, login, token, logout ,updateProfile,updatePassword,requestPasswordReset,resetPassword,verifyEmail,googleCallback,socailLogout,sendOTP,verifyOTP }; 