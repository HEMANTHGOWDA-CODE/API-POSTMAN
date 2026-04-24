const multer = require('multer');
const path = require('path');

// storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// file filter (optional but good)
const fileFilter = (req, file, cb) => {
  cb(null, true); // allow all for now
};

const upload = multer({
  storage,
  fileFilter
});

module.exports = upload;