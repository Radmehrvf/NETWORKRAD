const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed.'));
    }
    return cb(null, true);
  }
});

const removeStoredPhoto = (relativePath) => {
  if (!relativePath || !relativePath.startsWith('uploads/')) return;
  const absolutePath = path.join(__dirname, '..', relativePath);
  fs.promises
    .stat(absolutePath)
    .then(() => fs.promises.unlink(absolutePath))
    .catch(() => {});
};

module.exports = { upload, uploadsDir, removeStoredPhoto };
