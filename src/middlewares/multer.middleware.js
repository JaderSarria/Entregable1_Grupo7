const multer = require('multer');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { publicDir } = require('../utils/store');
const extensions = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(publicDir, 'img', file.fieldname === 'avatar' ? 'users' : 'pets'));
  },
  filename(req, file, cb) { cb(null, `${Date.now()}-${randomUUID()}${extensions[file.mimetype]}`); }
});
module.exports = multer({ storage, limits: { fileSize: 5 * 1024 * 1024, files: 5, fields: 12 },
  fileFilter(req, file, cb) {
    if (!extensions[file.mimetype]) return cb(Object.assign(new Error('Solo imágenes JPEG, PNG, WebP o GIF'), { status: 400 }));
    cb(null, true);
  }
});
