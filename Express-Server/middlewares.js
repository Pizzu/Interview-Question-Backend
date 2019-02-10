const jwt = require('jsonwebtoken');

function notFound(req, res, next) {
  res.status(404);
  const err = new Error('🔍 - Not Found - ' + req.originalUrl);
  next(err);
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  /* eslint-enable no-unused-vars */
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
}


async function checkTokenValidity(req, res, next) {
  const token = req.get('authorization');
  if (token) {
    try {
      const userId = await jwt.verify(token, process.env.TOKEN_SECRET);
      req.userId = userId.id;
      next();
    } catch (error) {
      const err = new Error('Unauthorized');
      res.status(401);
      next(err);
    }
  } else {
    const err = new Error('Unauthorized');
    res.status(401);
    next(err);
  }
}

module.exports = {
  notFound,
  errorHandler,
  checkTokenValidity
}