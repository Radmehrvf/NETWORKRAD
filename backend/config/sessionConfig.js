const session = require('express-session');

const createSession = ({ secret, nodeEnv }) =>
  session({
    name: 'networkrad.sid',
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: nodeEnv === 'production',
      maxAge: 1000 * 60 * 60 * 24
    }
  });

module.exports = createSession;
