const express = require('express');
const path = require('path');

const createUserRoutes = (deps) => {
  const {
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
  } = deps;

  const router = express.Router();

  router.get('/dashboard', ensureAuthenticated, (_req, res) => {
    return res.sendFile(path.join(staticDir, 'dashboard.html'));
  });

  router.get('/account-settings', ensureAuthenticated, (_req, res) => {
    return res.sendFile(path.join(staticDir, 'account-settings.html'));
  });

  router.get('/api/me', ensureApiAuthenticated, (req, res) => {
    return res.json({ user: req.session.user });
  });

  router.get('/api/profile', ensureApiAuthenticated, async (req, res) => {
    try {
      const profile = await getProfileForUser(req.session.user);
      return res.json({ profile });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  router.post(
    '/update-profile',
    ensureApiAuthenticated,
    upload.single('profilePhoto'),
    async (req, res, next) => {
      try {
        const profile = await getProfileForUser(req.session.user);
        if (!profile) {
          return sendAuthError(req, res, 404, 'Profile not found.');
        }

        const { fullName } = req.body || {};

        // Handle profile photo upload
        let photoPath = profile.profilePhoto;
        if (req.file) {
          if (photoPath && !photoPath.startsWith('http')) {
            removeStoredPhoto(photoPath);
          }
          photoPath = `uploads/${req.file.filename}`;
        }

        // Update user in database
        const updatedUser = await updateUserProfile(req.session.user.id, {
          name: fullName?.trim() || profile.fullName,
          profilePhoto: photoPath
        });

        // Update session
        const updatedProfile = await ensureProfileRecord(updatedUser);
        req.session.user = buildSessionUser(updatedProfile);

        if (wantsJSON(req)) {
          return res.json({ profile: updatedProfile });
        }
        return res.redirect('/dashboard');
      } catch (error) {
        console.error('Update profile error:', error);
        return next(error);
      }
    }
  );

  router.delete('/delete-account', ensureApiAuthenticated, async (req, res, next) => {
    try {
      const profile = await getProfileForUser(req.session.user);
      if (!profile) {
        return sendAuthError(req, res, 404, 'Profile not found.');
      }

      // Remove profile photo if exists
      if (profile.profilePhoto && !profile.profilePhoto.startsWith('http')) {
        removeStoredPhoto(profile.profilePhoto);
      }

      // Delete user from database
      await deleteUser(req.session.user.id);

      // Destroy session
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('networkrad.sid');
        return res.json({ success: true });
      });
    } catch (error) {
      console.error('Delete account error:', error);
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
