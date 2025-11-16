const wantsJSON = (req) => req.headers.accept?.includes('application/json') || req.xhr;

const sendAuthSuccess = (req, res, status = 200) => {
  const payload = { user: req.session.user };
  if (wantsJSON(req)) {
    return res.status(status).json(payload);
  }
  return res.redirect('/dashboard');
};

const sendAuthError = (req, res, status, message) => {
  if (wantsJSON(req)) {
    return res.status(status).json({ error: message });
  }
  return res.status(status).send(message);
};

module.exports = { wantsJSON, sendAuthSuccess, sendAuthError };
