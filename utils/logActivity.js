const ActivityLog = require('../models/log');

const logActivity = async (userId, action, req) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || 'Unknown'
    });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

module.exports = logActivity;
