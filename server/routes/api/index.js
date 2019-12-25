
const express = require('express');
const router = express.Router();

router.use('/rest', require('./rest'));

module.exports = router;
