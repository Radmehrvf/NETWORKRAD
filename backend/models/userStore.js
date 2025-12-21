const db = require('../config/db');
const bcrypt = require('bcrypt');

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const buildSessionUser = (data = {}) => ({
  id: data.id,
  email: data.email,
  name: data.name || data.fullName || data.username || data.email?.split('@')[0] || 'Radlinks member',
  username: data.username || data.email?.split('@')[0] || 'member',
  picture: data.picture || data.profilePhoto || null,
  provider: data.provider || 'password'
});

// Find user by email
const findUserByEmail = async (email) => {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [normalizeEmail(email)]);
  return rows[0] || null;
};

// Find user by Google ID
const findUserByGoogleId = async (googleId) => {
  const [rows] = await db.query('SELECT * FROM users WHERE googleId = ?', [googleId]);
  return rows[0] || null;
};

// Find user by ID
const findUserById = async (id) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
};

// Create new user (email/password signup)
const createUser = async (email, password, name = null) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
    [normalizeEmail(email), hashedPassword, name || email.split('@')[0]]
  );
  return findUserById(result.insertId);
};

// Create or update Google user
const createOrUpdateGoogleUser = async (profile) => {
  const email = normalizeEmail(profile.emails?.[0]?.value || '');
  const googleId = profile.id;
  const name = profile.displayName;
  const picture = profile.photos?.[0]?.value;

  // Check if user exists by googleId
  let user = await findUserByGoogleId(googleId);
  
  if (user) {
    // Update existing user
    await db.query(
      'UPDATE users SET name = ?, profilePhoto = ?, email = ? WHERE googleId = ?',
      [name, picture, email, googleId]
    );
    return findUserByGoogleId(googleId);
  }

  // Check if user exists by email
  user = await findUserByEmail(email);
  
  if (user) {
    // Link Google account to existing email account
    await db.query(
      'UPDATE users SET googleId = ?, name = ?, profilePhoto = ? WHERE email = ?',
      [googleId, name, picture, email]
    );
    return findUserByEmail(email);
  }

  // Create new user
  const [result] = await db.query(
    'INSERT INTO users (email, googleId, name, profilePhoto) VALUES (?, ?, ?, ?)',
    [email, googleId, name, picture]
  );
  return findUserById(result.insertId);
};

// Verify password
const verifyPassword = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user || !user.password) return null;
  
  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : null;
};

// Update user profile
const updateUserProfile = async (userId, updates) => {
  const allowedFields = ['name', 'profilePhoto'];
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) return findUserById(userId);

  values.push(userId);
  await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  return findUserById(userId);
};

// Delete user
const deleteUser = async (userId) => {
  await db.query('DELETE FROM users WHERE id = ?', [userId]);
  return true;
};

// Get profile for session user (compatibility function)
const ensureProfileRecord = async (data = {}) => {
  if (!data.id) return null;
  const user = await findUserById(data.id);
  return user ? {
    id: user.id,
    fullName: user.name,
    username: user.email?.split('@')[0],
    email: user.email,
    phone: '',
    address: '',
    dob: '',
    bio: '',
    createdAt: user.created_at,
    emailVerified: !!user.googleId,
    profilePhoto: user.profilePhoto
  } : null;
};

const getProfileForUser = async (sessionUser) => {
  if (!sessionUser) return null;
  return ensureProfileRecord(sessionUser);
};

module.exports = {
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
};
