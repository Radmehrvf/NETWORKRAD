const path = require('path');
const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

const createSession = require('./config/sessionConfig');
const configurePassport = require('./config/passportConfig');
const { upload, uploadsDir, removeStoredPhoto } = require('./config/upload');
const {
  localUsers,
  profileStore,
  normalizeEmail,
  ensureProfileRecord,
  buildSessionUser,
  getProfileForUser
} = require('./models/userStore');
const { wantsJSON, sendAuthSuccess, sendAuthError } = require('./utils/responses');
const { ensureAuthenticated, ensureApiAuthenticated } = require('./middleware/authMiddleware');
const createAuthRoutes = require('./routes/authRoutes');
const createUserRoutes = require('./routes/userRoutes');

dotenv.config({ path: path.join(__dirname, '.env') });

const {
  PORT = 5000,
  BASE_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  SESSION_SECRET,
  NODE_ENV = 'development'
} = process.env;

['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'SESSION_SECRET'].forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable ${key}`);
  }
});

const resolvedBaseUrl = BASE_URL || `http://localhost:${PORT}`;
const redirectUri =
  GOOGLE_REDIRECT_URI || `${resolvedBaseUrl.replace(/\/$/, '')}/auth/google/callback`;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(createSession({ secret: SESSION_SECRET, nodeEnv: NODE_ENV }));
app.use(passport.initialize());
app.use(passport.session());

const { googleScopes } = configurePassport(
  passport,
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: redirectUri
  },
  { ensureProfileRecord }
);

const staticDir = path.resolve(__dirname, '../frontend');
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(staticDir));

const authRoutes = createAuthRoutes({
  passport,
  bcrypt,
  googleScopes,
  localUsers,
  normalizeEmail,
  ensureProfileRecord,
  buildSessionUser,
  sendAuthSuccess,
  sendAuthError
});

const userRoutes = createUserRoutes({
  ensureAuthenticated,
  ensureApiAuthenticated,
  localUsers,
  profileStore,
  getProfileForUser,
  ensureProfileRecord,
  buildSessionUser,
  normalizeEmail,
  upload,
  removeStoredPhoto,
  sendAuthError,
  wantsJSON,
  staticDir
});

app.use(authRoutes);
app.use(userRoutes);

app.use((err, req, res, _next) => {
  console.error('OAuth error:', err);

  if (req.headers.accept?.includes('application/json')) {
    return res.status(500).json({ error: 'Authentication error', details: err.message });
  }

  return res
    .status(500)
    .send(
      `<h1>Something went wrong</h1><p>${err.message}</p><a href="/">Return to login</a>`
    );
});

app.use((req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  return res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${resolvedBaseUrl}`);
  console.log(`Google redirect URI: ${redirectUri}`);
});
