const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authmiddleware');
const authorizeAdmin = require('../middleware/autherizeadmin');
const validate = require('../middleware/validate');
const {roleChangeSchema}=require('../helper/validator');
const { getAllUsers, deleteUser,updateUserRole,getUsers } = require('../controllers/authcontroller');

router.get('/users', authenticate, authorizeAdmin, getAllUsers);
router.delete('/users/:id', authenticate, authorizeAdmin, deleteUser);
router.put('/update-role',validate(roleChangeSchema) ,authenticate, updateUserRole);
router.get('/user',authenticate,authorizeAdmin,getUsers);
module.exports = router;
