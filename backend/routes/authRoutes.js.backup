const express = require('express');
const { randomUUID } = require('crypto');

const createAuthRoutes = (deps) => {
  const {
    passport,
    bcrypt,
    googleScopes,
    localUsers,
    normalizeEmail,
    ensureProfileRecord,
    buildSessionUser,
    sendAuthSuccess,
    sendAuthError
  } = deps;

  const router = express.Router();

  router.post('/signup', async (req, res, next) => {
    const { email, password, confirmPassword, name, username } = req.body || {};

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
    if (localUsers.has(normalizedEmail)) {
      return sendAuthError(req, res, 409, 'An account with this email already exists.');
    }

    try {
      const passwordHash = await bcrypt.hash(password, 12);
      const userRecord = {
        id: randomUUID(),
        email: normalizedEmail,
        fullName: name?.trim() || '',
        name: name?.trim() || '',
        username: username?.trim() || normalizedEmail.split('@')[0],
        passwordHash,
        provider: 'password',
        createdAt: new Date().toISOString(),
        emailVerified: false,
        phone: '',
        address: '',
        dob: '',
        bio: '',
        profilePhoto: null
      };

      localUsers.set(normalizedEmail, userRecord);
      const profile = ensureProfileRecord(userRecord);
      req.session.user = buildSessionUser(profile);
      req.session.tokens = null;

      return sendAuthSuccess(req, res, 201);
    } catch (error) {
      return next(error);
    }
  });

  router.post('/login', async (req, res, next) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return sendAuthError(req, res, 400, 'Email and password are required.');
    }

    const normalizedEmail = normalizeEmail(email);
    const userRecord = localUsers.get(normalizedEmail);

    if (!userRecord) {
      return sendAuthError(req, res, 401, 'Invalid credentials.');
    }

    try {
      const passwordMatches = await bcrypt.compare(password, userRecord.passwordHash);
      if (!passwordMatches) {
        return sendAuthError(req, res, 401, 'Invalid credentials.');
      }

      const profile = ensureProfileRecord(userRecord);
      req.session.user = buildSessionUser(profile);
      req.session.tokens = null;
      return sendAuthSuccess(req, res);
    } catch (error) {
      return next(error);
    }
  });

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
    (req, res) => {
      const profileRecord = ensureProfileRecord({
        ...req.user.profile,
        provider: 'google',
        emailVerified: true
      });
      req.session.user = buildSessionUser(profileRecord);
      req.session.tokens = req.user.tokens;
      return sendAuthSuccess(req, res);
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
