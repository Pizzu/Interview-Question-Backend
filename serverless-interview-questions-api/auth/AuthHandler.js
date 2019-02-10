const connectToDatabase = require('../db');
const User = require('../models/user');
const Job = require('../models/job');
const Question = require('../models/question');
const SubJob = require('../models/subJob');
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
});

//Lambda functions
module.exports.signup = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase()
    const session = await signup(JSON.parse(event.body));
    return {
      statusCode: 200,
      body: JSON.stringify(session)
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({ message: error.message })
    };
  }
};

module.exports.login = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase()
    const session = await login(JSON.parse(event.body));
    return {
      statusCode: 200,
      body: JSON.stringify(session)
    }
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({ message: error.message })
    };
  }
};

module.exports.me = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase()
    const session = await me(event.requestContext.authorizer.principalId);
    return {
      statusCode: 200,
      body: JSON.stringify(session)
    }
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({ message: error.message })
    };
  }
};

//Helpers
function createToken(id) {
  return jwt.sign({id: id}, process.env.TOKEN_SECRET, {expiresIn: '1d'})
}

//Signup
async function signup(eventBody) {
  //We validate the body of the request
  const result = Joi.validate(eventBody, signupSchema);
  if (result.error === null) {
    try {
      const userFound = await User.findOne(
        {
          $or:[
          {username: eventBody.username},
          {email: eventBody.email}
          ]
        }).exec();
      if (userFound) {
        //This user already exists: Send an error back
        //res.status(409)
        const err = new Error('This email or username already exists. Please choose another one.');
        err.statusCode = 409
        throw err;
      }
      // Create user
      const newUser = {username: eventBody.username, email: eventBody.email, password: eventBody.password}
      const user = await User.create(newUser);
      const token = createToken(user._id);
      return {auth: true, token};
    } catch (error) {
      throw error
    }
  } else {
    //res.status(400);
    throw result.error;
  }
};

//Login
async function login(eventBody) {
  //We validate the body of the request
  const result = Joi.validate(eventBody, loginSchema);
  if (result.error === null) {
    try {
      const userFound = await User.findOne({email: eventBody.email}).exec();
      if (userFound) {
        //Check if the password is correct
        const hashResult = await bcrypt.compare(eventBody.password, userFound.password);
        if (hashResult) {
          //Correct Password
          const token = createToken(userFound._id);
          return ({auth: true, token});
        } else {
          //Wrong Password
          const err = new Error('The Email or Password you entered is incorrect.');
          throw err
        }
      } else {
        // No user with that email address
        const err = new Error('The Email or Password you entered is incorrect.');
        throw err
      }
    } catch (error) {
      throw error
    }
  } else {
    //res.status(400);
    throw result.error;
  }
};

//Me
async function me(userId) {
  try {
    const userFound = await User.findOne({_id: userId})
      .populate({path: 'questions', model: 'Question', populate: [{path:'createdBy', model: 'User'}, {path: 'mainJobCategory', model: 'Job'}, {path: 'mainSubJobCategory', model: 'SubJob'}]})
      .populate({path: 'favorites', model: 'Question', populate: [{path:'createdBy', model: 'User'}, {path: 'mainJobCategory', model: 'Job'}, {path: 'mainSubJobCategory', model: 'SubJob'}]})
      .exec();
    if (userFound) {
      return {user: userFound};
    } else {
      const err = new Error('No user found.');
      throw err
    }
  } catch (error) {
    throw error
  }
};