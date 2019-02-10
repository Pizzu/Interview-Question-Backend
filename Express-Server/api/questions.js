const express = require('express');
const router = express.Router({mergeParams: true});

const middleware = require('../middlewares');
const questions = require('../controllers/questions')

router.get('/', (req, res, next) => {
  //Retrive all jobs
  questions.getAllQuestions(req, res, next);
});

router.get('/:questionId', (req, res, next) => {
  //Retrive a specific job
  questions.getQuestion(req, res, next);
});

router.post('/', middleware.checkTokenValidity, (req, res, next) => {
  //Create a new job
  questions.createQuestion(req, res, next);
});

router.put('/:questionId/like', middleware.checkTokenValidity, (req, res, next) => {
  //Retrive a specific job
  questions.likeQuestion(req, res, next);
});

router.put('/:questionId/unlike', middleware.checkTokenValidity, (req, res, next) => {
  //Retrive a specific job
  questions.unlikeQuestion(req, res, next);
});

router.delete('/:questionId', middleware.checkTokenValidity, (req, res, next) => {
  //Retrive a specific job
  questions.deleteQuestion(req, res, next);
});

module.exports = router;