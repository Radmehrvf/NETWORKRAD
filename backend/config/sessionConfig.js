const session = require('express-session');

const normalizeSameSite = (value, fallback) => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (['lax', 'strict', 'none'].includes(normalized)) {
    return normalized;
  }
  return fallback;
};

const createSession = ({ secret, nodeEnv, sameSite, secure, cookieDomain, store } = {}) => {
  const isProduction = nodeEnv === 'production';
  const resolvedSameSite = normalizeSameSite(sameSite, 'lax');
  let resolvedSecure = typeof secure === 'boolean' ? secure : isProduction;

  if (resolvedSameSite === 'none' && !resolvedSecure) {
    resolvedSecure = true;
  }

  const cookie = {
    httpOnly: true,
    sameSite: resolvedSameSite,
    secure: resolvedSecure,
    maxAge: 1000 * 60 * 60 * 24
  };

  if (cookieDomain) {
    cookie.domain = cookieDomain;
  }

  return session({
    name: 'networkrad.sid',
    secret,
    resave: false,
    saveUninitialized: false,
    proxy: isProduction,
    cookie,
    store
  });
};

module.exports = createSession;
