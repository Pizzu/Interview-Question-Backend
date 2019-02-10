const express = require('express');
const router = express.Router();

const authentication = require('../controllers/authentication');

router.get('/', (req, res, next) => {
  authentication.me(req, res, next);
});

module.exports = router;