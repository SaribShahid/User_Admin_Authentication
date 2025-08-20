const express = require('express');
const logActivity=require('../utils/logActivity');
const User = require('../models/user');
const authenticate = require('../middleware/authmiddleware');
const router = express.Router();
const { register, login, token, logout,updateProfile,updatePassword,requestPasswordReset,resetPassword,sendOTP,verifyOTP} = require('../controllers/usercontroller');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema,updateSchema,passwordSchema } = require('../helper/validator');

router.post('/register',validate(registerSchema), register);
router.post('/login',validate(loginSchema), login);
router.post('/token', token);
router.post('/logout', logout);
router.put('/profile', validate(updateSchema),authenticate, updateProfile); 
router.put('/profile/password',validate(passwordSchema), authenticate, updatePassword);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/activity-logs',logActivity);
router.get("/verify/:token", async (req, res) => {
    const token = req.params.token;

    try {
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).send("Invalid or expired token.");
        }

        user.isVerified = true;
        await user.save();

        res.send("Email verified successfully!");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

module.exports = router; 