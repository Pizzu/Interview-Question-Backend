const express = require('express');
const router = express.Router();

const jobs = require('./jobs');


router.use('/jobs', jobs);

module.exports = router;