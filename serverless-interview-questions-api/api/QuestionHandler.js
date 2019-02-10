const connectToDatabase = require('../db');
const Question = require('../models/question');
const User = require('../models/user');
const Job = require('../models/job');
const SubJob = require('../models/subJob');
const Joi = require('joi');

//Joi validation schemas --- Project Schema
const addQuestionSchema = Joi.object().keys({
  title: Joi.string().min(2).max(30).required(),
  description: Joi.string().trim().min(2).required(),
});

module.exports.getAllQuestions = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase()
    const session = await getAllQuestions(event.pathParameters.id, event.pathParameters.subJobId);
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

module.exports.getQuestion = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase()
    const session = await getQuestion(event.pathParameters.id, event.pathParameters.subJobId, event.pathParameters.questionId);
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

module.exports.createQuestion = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase()
    const session = await createQuestion(JSON.parse(event.body), event.pathParameters.id, event.pathParameters.subJobId, event.requestContext.authorizer.principalId);
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

module.exports.likeQuestion = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase()
    const session = await likeQuestion(event.pathParameters.id, event.pathParameters.subJobId, event.pathParameters.questionId, event.requestContext.authorizer.principalId);
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

module.exports.unlikeQuestion = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase()
    const session = await unlikeQuestion(event.pathParameters.id, event.pathParameters.subJobId, event.pathParameters.questionId, event.requestContext.authorizer.principalId);
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

module.exports.deleteQuestion = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase()
    const session = await deleteQuestion(event.pathParameters.id, event.pathParameters.subJobId, event.pathParameters.questionId, event.requestContext.authorizer.principalId);
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

function checkAuthorization(questionAuthor, currentUser) {
  //The id returned from the mongoDb is an obj, so we have to use the methods equals.
  if (questionAuthor.equals(currentUser)) {
    return true;
  } else {
    return false;
  }
}

async function getAllQuestions(jobId, subJobId) {
  try {
    const questionsFound = await Question.find({
      $and:[
        {mainJobCategory: jobId},
        {mainSubJobCategory: subJobId}
      ]})
      .populate({path: 'createdBy', model: 'User'})
      .populate({path: 'mainJobCategory', model: 'Job'})
      .populate({path: 'mainSubJobCategory', model: 'SubJob'})
      .exec();
    return{questions: questionsFound};
  } catch (error) {
    throw error;
  }
}

async function getQuestion(jobId, subJobId, questionId) {
  try {
    const questionFound = await Question.findOne({
      $and:[
      {mainJobCategory: jobId},
      {mainSubJobCategory: subJobId},
      {_id: questionId}
      ]
    })
    .populate({path: 'createdBy', model: 'User'})
    .populate({path: 'mainJobCategory', model: 'Job'})
    .populate({path: 'mainSubJobCategory', model: 'SubJob'})
    .exec();
    if (questionFound) {
      return {question: questionFound};
    } else {
      const err = new Error('No question found.');
      err.statusCode = 400;
      throw err;
    }
  } catch (error) {
    throw error;
  }
}

async function createQuestion(eventBody, jobId, subJobId, userId) {
  const result = Joi.validate(eventBody, addQuestionSchema);
  if (result.error === null) {
    try {
      const questionObj = {...eventBody, mainJobCategory: jobId, mainSubJobCategory: subJobId, createdBy: userId};
      const questionCreated = await Question.create(questionObj);
      const userUpdated = await User.findByIdAndUpdate(userId, {$addToSet: {questions: questionCreated._id}}, {new: true}).populate({path: 'questions', model: 'Question', populate: {path:'createdBy', model: 'User'}}).exec();
      return {question: questionCreated, userQuestions: userUpdated.questions};
    } catch (error) {
      throw error;
    }
  } else {
    throw result.error;
  }
}

async function likeQuestion(jobId, subJobId, questionId, userId) {
  try {
    const questionFound = await Question.findOne({
      $and:[
      {mainJobCategory: jobId},
      {mainSubJobCategory: subJobId},
      {_id: questionId}
      ]
    }).exec();
    if (questionFound) {
      const userUpdated = await User.findByIdAndUpdate(userId, {$addToSet: {favorites: questionFound._id}}, {new: true}).populate({path: 'favorites', model: 'Question', populate: {path:'createdBy', model: 'User'}}).exec();
      return {favorites: userUpdated.favorites};
    } else {
      const err = new Error('No question found.');
      err.statusCode = 400
      throw err
    }
  } catch (error) {
    throw error;
  }
}

async function unlikeQuestion(jobId, subJobId, questionId, userId) {
  try {
    const questionFound = await Question.findOne({
      $and:[
      {mainJobCategory: jobId},
      {mainSubJobCategory: subJobId},
      {_id: questionId}
      ]
    }).exec();
    if (questionFound) {
      const userUpdated = await User.findByIdAndUpdate(userId, {$pull: {favorites: questionFound._id}}, {new: true}).populate({path: 'favorites', model: 'Question', populate: {path:'createdBy', model: 'User'}}).exec();
      return {favorites: userUpdated.favorites};
    } else {
      const err = new Error('No question found.');
      err.statusCode = 400;
      throw err;
    }
  } catch (error) {
    throw error;
  }
}

async function deleteQuestion(jobId, subJobId, questionId, userId) {
  try {
    const questionFound = await Question.findOne({
      $and:[
        {mainJobCategory: jobId},
        {mainSubJobCategory: subJobId},
        {_id: questionId}
      ]}).exec();
    if (questionFound) {
      if (checkAuthorization(questionFound.createdBy, userId)) {
        await Question.findByIdAndDelete(questionFound._id).exec();
        return {deleted: true};    
      } else {
        const err = new Error('Unauthorized');
        err.statusCode = 401;
        throw err;
      }
    } else {
      const err = new Error('No question found.');
      err.statusCode = 400;
      throw err;
    }
  } catch (error) {
    throw error;
  }
}
