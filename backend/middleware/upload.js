const multer = require('multer');
const path = require('path');

// Where and how to save uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // e.g. post-1721568234567.jpg — unique name to avoid overwrites
    const uniqueName = `post-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValidType = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (isValidType) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg, .png, .webp images are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

module.exports = upload;