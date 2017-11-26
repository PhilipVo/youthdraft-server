const   multer    = require('multer'),
        path      = require('path'),
        uuid      = require('uuid/v1');


const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './uploads')
  },
  filename: function(req, file, callback) {
    callback(null, uuid().replace(/\-/g, "") + path.extname(file.originalname))
  }
})

const fileFilter = function(req, file, callback) {
  const ext = path.extname(file.originalname)
  if (ext !== '.csv' && ext !== '.xlsx') {
    return callback(new Error('Only .csv and .xlsx files are allowed'))
  }
  callback(null, true)
}

module.exports = multer({ storage: storage, fileFilter: fileFilter});
