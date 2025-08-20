const express = require('express');
const passport = require('../config/passport');  

const router = express.Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: true }),
  (req, res) => {
    res.json({ message: 'Google login successful', user: req.user });
  }
);

module.exports = router;
