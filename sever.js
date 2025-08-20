const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
require('dotenv').config();
const userRoutes = require('./routes/userroutes');
const authRoutes = require('./routes/authroutes');
const protectedRoutes = require('./routes/protectedRoutes');
const passport = require('./config/passport');
const socailRoutes = require('./routes/socailRoutes'); 

const app = express();

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret123',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/socail', socailRoutes);       
app.use('/', userRoutes); 
app.use('/api/auth', userRoutes);
app.use('/api', protectedRoutes);
app.use('/api/admin', authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(3000, () => console.log('Server running on port 3000'));
  })
  .catch(err => console.error('DB error:', err));
