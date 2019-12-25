
const express = require('express');
const router = express.Router();

router.use('/tags', require('./tags'));
router.use('/posts', require('./posts'));

module.exports = router;
