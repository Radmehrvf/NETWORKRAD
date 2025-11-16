const { Strategy: GoogleStrategy } = require('passport-google-oauth20');

const configurePassport = (passport, options, helpers) => {
  const { clientID, clientSecret, callbackURL } = options;
  const { ensureProfileRecord } = helpers;

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        passReqToCallback: false
      },
      (accessToken, refreshToken, profile, done) => {
        try {
          const record = ensureProfileRecord({
            id: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
            provider: 'google',
            emailVerified: true
          });

          return done(null, {
            profile: record,
            tokens: {
              accessToken,
              refreshToken
            }
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  return {
    googleScopes: [
      'openid',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  };
};

module.exports = configurePassport;
