const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

//Joi validation schemas
const signupSchema = Joi.object().keys({
  username: Joi.string().regex(/(^[a-zA-Z0-9_]+$)/).min(2).max(30).required(),
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object().keys({
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(6).required()
})

//Helpers
function createToken(id) {
  return jwt.sign({id: id}, process.env.TOKEN_SECRET, {expiresIn: '1d'})
}

//Signup
async function signup(req, res, next) {
  //We validate the body of the request
  const result = Joi.validate(req.body, signupSchema);
  if (result.error === null) {
    try {
      const userFound = await User.findOne(
        {
          $or:[
          {username: req.body.username},
          {email: req.body.email}
          ]
        }).exec();
      if (userFound) {
        //This user already exists: Send an error back
        res.status(409)
        const err = new Error('This email or username already exists. Please choose another one.');
        next(err);
      }
      // Create user
      const newUser = {username: req.body.username, email: req.body.email, password: req.body.password}
      const user = await User.create(newUser);
      const token = createToken(user._id);
      res.json({auth: true, token})
    } catch (error) {
      const err = new Error('Sorry! Something went wrong. Try again.');
      next(err);
    }
  } else {
    res.status(400);
    next(result.error);
  }
}

//Login
async function login(req, res, next) {
  //We validate the body of the request
  const result = Joi.validate(req.body, loginSchema);
  if (result.error === null) {
    try {
      const userFound = await User.findOne({email: req.body.email}).exec();
      if (userFound) {
        //Check if the password is correct
        const hashResult = await bcrypt.compare(req.body.password, userFound.password);
        if (hashResult) {
          //Correct Password
          const token = createToken(userFound._id);
          res.json({auth: true, token});
        } else {
          //Wrong Password
          res.status(422);
          const err = new Error('The Email or Password you entered is incorrect.');
          next(err);
        }
      } else {
        // No user with that email address
        res.status(422);
        const err = new Error('The Email or Password you entered is incorrect.');
        next(err);
      }
    } catch (error) {
      const err = new Error('Sorry! Something went wrong. Try again.');
      next(err);
    }
  } else {
    res.status(400);
    next(result.error);
  }
}

//Me
async function me(req, res, next) {
  try {
    const userFound = await User.findOne({_id: req.userId})
      .populate({path: 'questions', model: 'Question', populate: [{path:'createdBy', model: 'User'}, {path: 'mainJobCategory', model: 'Job'}, {path: 'mainSubJobCategory', model: 'SubJob'}]})
      .populate({path: 'favorites', model: 'Question', populate: [{path:'createdBy', model: 'User'}, {path: 'mainJobCategory', model: 'Job'}, {path: 'mainSubJobCategory', model: 'SubJob'}]})
      .exec();
    if (userFound) {
      res.json({user: userFound});
    } else {
      res.status(422);
      const err = new Error('No user found.');
      next(err);
    }
  } catch (error) {
    const err = new Error('Sorry! Something went wrong. Try again.');
    next(err);
  }
}

module.exports = {
  signup,
  login,
  me
}