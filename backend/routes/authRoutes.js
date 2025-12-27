const express = require('express');

const createAuthRoutes = (deps) => {
  const {
    passport,
    googleScopes,
    normalizeEmail,
    findUserByEmail,
    createUser,
    verifyPassword,
    ensureProfileRecord,
    buildSessionUser,
    sendAuthSuccess,
    sendAuthError
  } = deps;

  const router = express.Router();
  const persistSession = (req) =>
    new Promise((resolve, reject) => {
      if (!req.session) return resolve();
      req.session.save((err) => (err ? reject(err) : resolve()));
    });

  // Signup route
  router.post('/signup', async (req, res, next) => {
    const { email, password, confirmPassword, name } = req.body || {};

    if (!email || !password || !confirmPassword) {
      return sendAuthError(req, res, 400, 'Email and password are required.');
    }

    if (password.length < 6) {
      return sendAuthError(req, res, 400, 'Password must be at least 6 characters.');
    }

    if (password !== confirmPassword) {
      return sendAuthError(req, res, 400, 'Passwords do not match.');
    }

    const normalizedEmail = normalizeEmail(email);

    try {
      // Check if user already exists
      const existingUser = await findUserByEmail(normalizedEmail);
      if (existingUser) {
        return sendAuthError(req, res, 409, 'An account with this email already exists.');
      }

      // Create new user
      const newUser = await createUser(normalizedEmail, password, name);
      
      // Create profile and session
      const profile = await ensureProfileRecord(newUser);
      req.session.user = buildSessionUser(profile);
      req.session.tokens = null;

      await persistSession(req);
      return sendAuthSuccess(req, res, 201);
    } catch (error) {
      console.error('Signup error:', error);
      return next(error);
    }
  });

  // Login route
  router.post('/login', async (req, res, next) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return sendAuthError(req, res, 400, 'Email and password are required.');
    }

    const normalizedEmail = normalizeEmail(email);

    try {
      // Verify user credentials
      const user = await verifyPassword(normalizedEmail, password);
      
      if (!user) {
        return sendAuthError(req, res, 401, 'Invalid credentials.');
      }

      // Create profile and session
      const profile = await ensureProfileRecord(user);
      req.session.user = buildSessionUser(profile);
      req.session.tokens = null;

      await persistSession(req);
      return sendAuthSuccess(req, res);
    } catch (error) {
      console.error('Login error:', error);
      return next(error);
    }
  });

  // Google OAuth routes
  router.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: googleScopes,
      accessType: 'offline',
      prompt: 'consent'
    })
  );

  router.get(
    '/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/auth/error?message=Authentication%20failed'
    }),
    async (req, res) => {
      try {
        const profileRecord = await ensureProfileRecord({
          ...req.user.profile,
          provider: 'google',
          emailVerified: true
        });
        
        req.session.user = buildSessionUser(profileRecord);
        req.session.tokens = req.user.tokens;

        await persistSession(req);
        return sendAuthSuccess(req, res);
      } catch (error) {
        console.error('Google callback error:', error);
        return res.redirect('/auth/error?message=Failed%20to%20create%20profile');
      }
    }
  );

  router.get('/auth/error', (req, res) => {
    const message = req.query.message || 'Authentication failed.';
    return res.status(401).send(`
      <h1>Google authentication error</h1>
      <p>${message}</p>
      <a href="/">Return to login</a>
    `);
  });

  return router;
};

module.exports = createAuthRoutes;
