const ensureAuthenticated = (req, res, next) => {
  if (req.session?.user) {
    return next();
  }
  if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/');
};

const ensureApiAuthenticated = (req, res, next) => {
  if (req.session?.user) {
    return next();
  }
  if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
};

module.exports = { ensureAuthenticated, ensureApiAuthenticated };
