const express = require('express');
const router = express.Router();

const authentication = require('../controllers/authentication');

router.post('/', (req, res, next) => {
  authentication.login(req, res, next);
});

module.exports = router;