const Question = require('../models/question');
const User = require('../models/user');
const Joi = require('joi');

//Joi validation schemas --- Project Schema
const addQuestionSchema = Joi.object().keys({
  title: Joi.string().min(2).max(30).required(),
  description: Joi.string().trim().min(2).required(),
});

//Helpers
function checkAuthorization(questionAuthor, currentUser) {
  //The id returned from the mongoDb is an obj, so we have to use the methods equals.
  if (questionAuthor.equals(currentUser)) {
    return true;
  } else {
    return false;
  }
}

async function getAllQuestions(req, res, next) {
  try {
    const questionsFound = await Question.find({
      $and:[
        {mainJobCategory: req.params.id},
        {mainSubJobCategory: req.params.subjobdId}
      ]})
      .populate({path: 'createdBy', model: 'User'})
      .populate({path: 'mainJobCategory', model: 'Job'})
      .populate({path: 'mainSubJobCategory', model: 'SubJob'})
      .exec();
    res.json({questions: questionsFound});
  } catch (error) {
    const err = new Error('Sorry! Something went wrong. Try again.');
    next(err);
  }
}

async function getQuestion(req, res, next) {
  try {
    const questionFound = await Question.findOne({
      $and:[
      {mainJobCategory: req.params.id},
      {mainSubJobCategory: req.params.subjobdId},
      {_id: req.params.questionId}
      ]
    })
    .populate({path: 'createdBy', model: 'User'})
    .populate({path: 'mainJobCategory', model: 'Job'})
    .populate({path: 'mainSubJobCategory', model: 'SubJob'})
    .exec();
    if (questionFound) {
      res.json({question: questionFound});
    } else {
      res.status(400);
      const err = new Error('No question found.');
      next(err);
    }
  } catch (error) {
    const err = new Error('Sorry! Something went wrong. Try again.');
    next(err);
  }
}

async function createQuestion(req, res, next) {
  const result = Joi.validate(req.body, addQuestionSchema);
  if (result.error === null) {
    try {
      const questionObj = {...req.body, mainJobCategory: req.params.id, mainSubJobCategory: req.params.subjobdId, createdBy: req.userId};
      const questionCreated = await Question.create(questionObj);
      const userUpdated = await User.findByIdAndUpdate(req.userId, {$addToSet: {questions: questionCreated._id}}, {new: true}).populate({path: 'questions', model: 'Question', populate: {path:'createdBy', model: 'User'}}).exec();
      res.json({question: questionCreated, userQuestions: userUpdated.questions});
    } catch (error) {
      const err = new Error('Sorry! Something went wrong. Try again.');
      next(err);
    }
  } else {
    res.status(400);
    next(result.error);
  }
}

async function likeQuestion(req, res, next) {
  try {
    const questionFound = await Question.findOne({
      $and:[
      {mainJobCategory: req.params.id},
      {mainSubJobCategory: req.params.subjobdId},
      {_id: req.params.questionId}
      ]
    }).exec();
    if (questionFound) {
      const userUpdated = await User.findByIdAndUpdate(req.userId, {$addToSet: {favorites: questionFound._id}}, {new: true}).populate({path: 'favorites', model: 'Question', populate: {path:'createdBy', model: 'User'}}).exec();
      res.json({favorites: userUpdated.favorites});
    } else {
      res.status(400);
      const err = new Error('No question found.');
      next(err);
    }
  } catch (error) {
    const err = new Error('Sorry! Something went wrong. Try again.');
    next(err);
  }
}

async function unlikeQuestion(req, res, next) {
  try {
    const questionFound = await Question.findOne({
      $and:[
      {mainJobCategory: req.params.id},
      {mainSubJobCategory: req.params.subjobdId},
      {_id: req.params.questionId}
      ]
    }).exec();
    if (questionFound) {
      const userUpdated = await User.findByIdAndUpdate(req.userId, {$pull: {favorites: questionFound._id}}, {new: true}).populate({path: 'favorites', model: 'Question', populate: {path:'createdBy', model: 'User'}}).exec();
      res.json({favorites: userUpdated.favorites});
    } else {
      res.status(400);
      const err = new Error('No question found.');
      next(err);
    }
  } catch (error) {
    const err = new Error('Sorry! Something went wrong. Try again.');
    next(err);
  }
}

async function deleteQuestion(req, res, next) {
  try {
    const questionFound = await Question.findOne({
      $and:[
        {mainJobCategory: req.params.id},
        {mainSubJobCategory: req.params.subjobdId},
        {_id: req.params.questionId}
      ]}).exec();
    if (questionFound) {
      if (checkAuthorization(questionFound.createdBy, req.userId)) {
        await Question.findByIdAndDelete(questionFound._id).exec();
        res.json({deleted: true});    
      } else {
        const err = new Error('Unauthorized');
        res.status(401);
        next(err);
      }
    } else {
      res.status(400);
      const err = new Error('No question found.');
      next(err);
    }
  } catch (error) {
    const err = new Error('Sorry! Something went wrong. Try again.');
    next(err);
  }
}


module.exports = {
  getAllQuestions,
  getQuestion,
  createQuestion,
  likeQuestion,
  unlikeQuestion,
  deleteQuestion
}