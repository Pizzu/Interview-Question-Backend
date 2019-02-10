const express = require('express');
const router = express.Router();

const signup = require('./signup');
const login = require('./login');
const me = require('./me');

const middleware = require('../middlewares'); 

router.get('/', (req, res) => {
  res.json({
    msg: 'Authentication endpoint 🔐👨🏼‍💻'
  })
});

router.use('/signup', signup);
router.use('/login', login);
router.use('/me', middleware.checkTokenValidity, me);

module.exports = router;