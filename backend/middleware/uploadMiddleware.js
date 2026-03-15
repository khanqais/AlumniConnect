const multer = require('multer');
const path = require('path');

// Set storage engine to memory storage for Vercel compatibility
// Files will be available as req.file.buffer
const storage = multer.memoryStorage();

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images, PDFs, and Documents only!');
    }
}

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = upload;
