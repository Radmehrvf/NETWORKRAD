const localUsers = new Map();
const profileStore = new Map();

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const buildSessionUser = (data = {}) => ({
  id: data.id,
  email: data.email,
  name:
    data.name ||
    data.fullName ||
    data.username ||
    data.email?.split('@')[0] ||
    'NetworkRad member',
  username: data.username || data.email?.split('@')[0] || 'member',
  picture: data.picture || data.profilePhoto || null,
  provider: data.provider || 'password'
});

const ensureProfileRecord = (data = {}) => {
  if (!data.id) return null;
  const existing = profileStore.get(data.id) || {};
  const profile = {
    id: data.id,
    fullName: data.fullName || data.name || existing.fullName || data.email,
    username: data.username || existing.username || data.email?.split('@')[0],
    email: data.email || existing.email,
    phone: data.phone ?? existing.phone ?? '',
    address: data.address ?? existing.address ?? '',
    dob: data.dob ?? existing.dob ?? '',
    bio: data.bio ?? existing.bio ?? '',
    createdAt: data.createdAt || existing.createdAt || new Date().toISOString(),
    emailVerified:
      data.emailVerified !== undefined
        ? data.emailVerified
        : existing.emailVerified ?? data.provider === 'google',
    profilePhoto: data.profilePhoto || existing.profilePhoto || data.picture || null
  };
  profileStore.set(data.id, profile);
  return profile;
};

const getProfileForUser = (sessionUser) => {
  if (!sessionUser) return null;
  return ensureProfileRecord(sessionUser);
};

module.exports = {
  localUsers,
  profileStore,
  normalizeEmail,
  buildSessionUser,
  ensureProfileRecord,
  getProfileForUser
};
