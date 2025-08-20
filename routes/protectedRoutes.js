const express = require('express');
const authenticate = require('../middleware/authmiddleware');

const router = express.Router();

router.get('/profile', authenticate, (req, res) => {
  res.json({
    message: 'Profile access granted',
    user: req.user
  });
});

module.exports = router;
