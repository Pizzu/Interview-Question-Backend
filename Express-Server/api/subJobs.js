const express = require('express');
const router = express.Router({mergeParams: true});

const subJobs = require('../controllers/subJobs');
const questions = require('./questions')

router.get('/', (req, res, next) => {
  //Retrive all jobs
  subJobs.getAllSubJobs(req, res, next);
});

router.get('/:subjobdId', (req, res, next) => {
  //Retrive a specific job
  subJobs.getSubJob(req, res, next);
});

router.post('/', (req, res, next) => {
  //Create a new job
  subJobs.createSubJob(req, res, next);
});

router.use('/:subjobdId/questions', questions)


module.exports = router;