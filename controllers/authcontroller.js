const jwt = require('jsonwebtoken');
const User = require('../models/user');
const logActivity=require('../utils/logActivity');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
  await logActivity(req.user.id, 'Admin check all users', req);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    };

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .skip(skip)
      .limit(Number(limit))
      .select('-password -refreshToken'); 
  await logActivity(req.user.id, 'Admin check users', req);
    const totalUsers = await User.countDocuments(query);
    res.json({
      page: Number(page),
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      users
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  await logActivity(user._id, 'Admin delete user', req);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const admin = req.user;

    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }


    const { userId, newRole } = req.body;

    if (!userId || !newRole) {
      return res.status(400).json({ message: 'User ID and new role are required' });
    }
    const user = await User.findById(userId);
     
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if(user.role===newRole) return res.status(404).json({message:'Role is same'})
    user.role = newRole;
    await user.save();

    res.status(200).json({ message: 'User role updated successfully', user });
  await logActivity(user._id, 'Admin Update User Role', req);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update role', error: err.message });
  }
};


module.exports = { getAllUsers, deleteUser,updateUserRole,getUsers };
