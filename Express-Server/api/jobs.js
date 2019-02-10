const express = require('express');
const router = express.Router();

const jobs = require('../controllers/jobs');
const subJobs = require('./subJobs');

router.get('/', (req, res, next) => {
  //Retrive all jobs
  jobs.getAllJobs(req, res, next);
});

router.get('/:id', (req, res, next) => {
  //Retrive a specific job
  jobs.getJob(req, res, next);
});

router.post('/', (req, res, next) => {
  //Create a new job
  jobs.createJob(req, res, next);
});

router.use('/:id/subjobs', subJobs);

module.exports = router;