const express = require('express');
const path = require('path');

const createUserRoutes = (deps) => {
  const {
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
  } = deps;

  const router = express.Router();

  router.get('/dashboard', ensureAuthenticated, (_req, res) => {
    return res.sendFile(path.join(staticDir, 'dashboard.html'));
  });

  router.get('/account-settings', ensureAuthenticated, (_req, res) => {
    return res.sendFile(path.join(staticDir, 'account-settings.html'));
  });

  router.get('/api/me', ensureAuthenticated, (req, res) => {
    return res.json({ user: req.session.user });
  });

  router.get('/api/profile', ensureAuthenticated, (req, res) => {
    const profile = getProfileForUser(req.session.user);
    return res.json({ profile });
  });

  router.post(
    '/update-profile',
    ensureAuthenticated,
    upload.single('profilePhoto'),
    async (req, res, next) => {
      try {
        const profile = getProfileForUser(req.session.user);
        if (!profile) {
          return sendAuthError(req, res, 404, 'Profile not found.');
        }

        const {
          fullName,
          username,
          email,
          phone,
          address,
          dob,
          bio
        } = req.body || {};

        const normalizedEmail = email ? normalizeEmail(email) : profile.email;
        if (req.session.user.provider === 'password') {
          const currentRecord = localUsers.get(normalizeEmail(profile.email));
          if (!currentRecord) {
            return sendAuthError(req, res, 404, 'User record not found.');
          }
          if (normalizedEmail !== profile.email && localUsers.has(normalizedEmail)) {
            return sendAuthError(req, res, 409, 'Another account already uses this email.');
          }

          currentRecord.fullName = fullName?.trim() || profile.fullName;
          currentRecord.name = currentRecord.fullName;
          currentRecord.username = username?.trim() || profile.username;
          currentRecord.email = normalizedEmail;
          currentRecord.phone = phone?.trim() || '';
          currentRecord.address = address?.trim() || '';
          currentRecord.dob = dob || '';
          currentRecord.bio = bio?.trim() || '';
          if (normalizedEmail !== profile.email) {
            localUsers.delete(normalizeEmail(profile.email));
            localUsers.set(normalizedEmail, currentRecord);
          }
        }

        let photoPath = profile.profilePhoto;
        if (req.file) {
          if (photoPath && !photoPath.startsWith('http')) {
            removeStoredPhoto(photoPath);
          }
          photoPath = `uploads/${req.file.filename}`;
        }

        const updatedProfile = {
          ...profile,
          fullName: fullName?.trim() || profile.fullName,
          username: username?.trim() || profile.username,
          email: normalizedEmail,
          phone: phone?.trim() || '',
          address: address?.trim() || '',
          dob: dob || '',
          bio: bio?.trim() || '',
          profilePhoto: photoPath
        };

        const storedProfile = ensureProfileRecord(updatedProfile);
        req.session.user = buildSessionUser(storedProfile);

        if (wantsJSON(req)) {
          return res.json({ profile: storedProfile });
        }
        return res.redirect('/dashboard');
      } catch (error) {
        return next(error);
      }
    }
  );

  router.delete('/delete-account', ensureApiAuthenticated, async (req, res, next) => {
    try {
      const profile = getProfileForUser(req.session.user);
      if (!profile) {
        return sendAuthError(req, res, 404, 'Profile not found.');
      }

      if (profile.profilePhoto && !profile.profilePhoto.startsWith('http')) {
        removeStoredPhoto(profile.profilePhoto);
      }

      if (req.session.user.provider === 'password') {
        localUsers.delete(normalizeEmail(profile.email));
      }

      profileStore.delete(profile.id);

      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('networkrad.sid');
        return res.json({ success: true });
      });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/logout', (req, res, next) => {
    req.logout((logoutErr) => {
      if (logoutErr) {
        return next(logoutErr);
      }
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        res.clearCookie('networkrad.sid');
        return res.redirect('/');
      });
    });
  });

  return router;
};

module.exports = createUserRoutes;
