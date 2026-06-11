const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

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

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ oauthId: profile.id, oauthProvider: 'google' });

        if (!user) {
          // Check if email exists
          let existingEmailUser = null;
          if (profile.emails && profile.emails.length > 0) {
             existingEmailUser = await User.findOne({ email: profile.emails[0].value });
          }

          if (existingEmailUser) {
             // Link the account or return an error (we'll just link it for simplicity, or return early)
             user = existingEmailUser;
             user.oauthProvider = 'google';
             user.oauthId = profile.id;
             await user.save();
          } else {
             user = await User.create({
              name: profile.displayName,
              email: profile.emails ? profile.emails[0].value : `${profile.id}@google.com`, // Fallback if no email
              profileImage: profile.photos ? profile.photos[0].value : '',
              oauthProvider: 'google',
              oauthId: profile.id,
              role: 'student', // Default role
            });
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/api/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ oauthId: profile.id, oauthProvider: 'github' });

        if (!user) {
          let existingEmailUser = null;
          if (profile.emails && profile.emails.length > 0) {
             existingEmailUser = await User.findOne({ email: profile.emails[0].value });
          }

          if (existingEmailUser) {
             user = existingEmailUser;
             user.oauthProvider = 'github';
             user.oauthId = profile.id;
             await user.save();
          } else {
             user = await User.create({
              name: profile.displayName || profile.username,
              email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`,
              profileImage: profile.photos ? profile.photos[0].value : '',
              oauthProvider: 'github',
              oauthId: profile.id,
              role: 'student',
            });
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
