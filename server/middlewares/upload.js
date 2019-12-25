const multer = require('multer');

const upload = multer({
    limits: {
        fileSize: 4 * 1024 * 1024,
    },
    preservePath: false,
});

module.exports = upload;
