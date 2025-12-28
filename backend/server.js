const path = require('path');
const express = require('express');
const session = require('express-session');
const connectRedis = require('connect-redis');
const { createClient } = require('redis');
const passport = require('passport');
const dotenv = require('dotenv');

const createSession = require('./config/sessionConfig');
const configurePassport = require('./config/passportConfig');
const { upload, uploadsDir, removeStoredPhoto } = require('./config/upload');

const {
  normalizeEmail,
  buildSessionUser,
  findUserByEmail,
  findUserByGoogleId,
  findUserById,
  createUser,
  createOrUpdateGoogleUser,
  verifyPassword,
  updateUserProfile,
  deleteUser,
  ensureProfileRecord,
  getProfileForUser
} = require('./models/userStore');

const { wantsJSON, sendAuthSuccess, sendAuthError } = require('./utils/responses');
const { ensureAuthenticated, ensureApiAuthenticated } = require('./middleware/authMiddleware');
const createAuthRoutes = require('./routes/authRoutes');
const createUserRoutes = require('./routes/userRoutes');

dotenv.config({ path: path.join(__dirname, '.env') });

const {
  PORT = 5001,
  BASE_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  SESSION_SECRET,
  NODE_ENV = 'development',
  SESSION_SAMESITE,
  SESSION_DOMAIN,
  SESSION_SECURE,
  REDIS_URL,
  REDIS_HOST,
  REDIS_PORT,
  CORS_ORIGIN
} = process.env;

['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'].forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable ${key}`);
  }
});

const resolvedSessionSecret =
  typeof SESSION_SECRET === 'string' ? SESSION_SECRET.trim() : '';

if (!resolvedSessionSecret || resolvedSessionSecret.length < 32) {
  console.error('SESSION_SECRET is missing or too weak');
  process.exit(1);
}

const resolvedBaseUrl = BASE_URL || `http://localhost:${PORT}`;
const redirectUri =
  GOOGLE_REDIRECT_URI || `${resolvedBaseUrl.replace(/\/$/, '')}/auth/google/callback`;

const resolveBoolean = (value) => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return undefined;
};

const deriveCookieDomainFromHost = (hostname) => {
  if (!hostname || hostname === 'localhost') return undefined;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return undefined;
  const parts = hostname.split('.').filter(Boolean);
  if (parts.length < 2) return undefined;
  const rootDomain = parts.slice(-2).join('.');
  return `.${rootDomain}`;
};

const resolveCookieDomain = (baseUrl) => {
  if (!baseUrl) return undefined;
  try {
    const { hostname } = new URL(baseUrl);
    return deriveCookieDomainFromHost(hostname);
  } catch (_error) {
    return undefined;
  }
};

const app = express();
if (NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const RedisStore = connectRedis(session);

const resolvedRedisPort = Number(REDIS_PORT) || 6379;
const redisClient = createClient(
  REDIS_URL
    ? { url: REDIS_URL }
    : {
        socket: {
          host: REDIS_HOST || '127.0.0.1',
          port: resolvedRedisPort
        }
      }
);

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

redisClient.connect().catch((err) => {
  console.error('Redis connection failed:', err);
});

const redisStore = new RedisStore({ client: redisClient });

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const allowedOrigins = (CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.length) {
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Accept, X-Requested-With'
      );
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
      );
      if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
      }
    }
    return next();
  });
}

app.use(
  createSession({
    store: redisStore,
    secret: resolvedSessionSecret,
    nodeEnv: NODE_ENV,
    sameSite: SESSION_SAMESITE,
    secure: resolveBoolean(SESSION_SECURE),
    cookieDomain: SESSION_DOMAIN || resolveCookieDomain(resolvedBaseUrl)
  })
);
app.use((req, _res, next) => {
  if (req.session && !req.session.cookie.domain) {
    const derivedDomain = deriveCookieDomainFromHost(req.hostname);
    if (derivedDomain) {
      req.session.cookie.domain = derivedDomain;
    }
  }
  return next();
});
app.use(passport.initialize());
app.use(passport.session());

const { googleScopes } = configurePassport(
  passport,
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: redirectUri
  },
  { createOrUpdateGoogleUser }
);

const staticDir = path.resolve(__dirname, '..');
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(staticDir));

const authRoutes = createAuthRoutes({
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
});

const userRoutes = createUserRoutes({
  ensureAuthenticated,
  ensureApiAuthenticated,
  findUserById,
  updateUserProfile,
  deleteUser,
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

app.use((req, res, next) => {
  if (wantsJSON(req)) {
    return res.status(404).json({ error: 'Page not found' });
  }
  return next();
});

app.use((req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  return res.sendFile(path.join(staticDir, 'index.html'));
});

app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);

  if (wantsJSON(req)) {
    return res.status(500).json({ error: 'Something went wrong!' });
  }

  return res
    .status(500)
    .send(
      '<h1>Something went wrong!</h1><p>Please try again later.</p><a href="/">Return to login</a>'
    );
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${resolvedBaseUrl}`);
  console.log(`Google redirect URI: ${redirectUri}`);
});
