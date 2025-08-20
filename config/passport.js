const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const passport = require('passport');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {  
         try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          const username = profile.displayName.replace(/\s+/g, '').toLowerCase();

          user = await User.create({
            username,
            email: profile.emails[0].value,
            password: '',        
            role: 'user',
            isVerified: true,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
