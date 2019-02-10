const Job = require('../models/job');
const Joi = require('joi');

const addJobSchema = Joi.object().keys({
  title: Joi.string().min(2).max(30).required(),
  imageUrl: Joi.string().uri().trim().required(),
});

async function getAllJobs(req, res, next) {
  try {
    const jobsFound = await Job.find({}).exec();
    res.json({jobs: jobsFound});
  } catch (error) {
    const err = new Error('Sorry! Something went wrong. Try again.');
    next(err);
  }
}

async function getJob(req, res, next) {
  try {
    const jobFound = await Job.findOne({_id: req.params.id}).exec();
    if (jobFound) {
      res.json({job: jobFound});
    } else {
      res.status(400);
      const err = new Error('No job found.');
      next(err);
    }
  } catch (error) {
    const err = new Error('Sorry! Something went wrong. Try again.');
    next(err);
  }
}

async function createJob(req, res, next) {
  const result = Joi.validate(req.body, addJobSchema);
  if (result.error === null) {
    try {
      const jobObj = { ...req.body };
      const jobCreated = await Job.create(jobObj);
      res.json({job: jobCreated});
    } catch (error) {
      const err = new Error('Sorry! Something went wrong. Try again.');
      next(err);
    }
  } else {
    res.status(400);
    next(result.error);
  }
}



module.exports = {
  getAllJobs,
  getJob,
  createJob
}