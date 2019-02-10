const SubJob = require('../models/subJob');
const Joi = require('joi');

//Joi validation schemas --- Project Schema
const addSubJobSchema = Joi.object().keys({
  title: Joi.string().min(2).max(30).required(),
  imageUrl: Joi.string().uri().trim().required(),
});

async function getAllSubJobs(req, res, next) {
  try {
    const subJobsFound = await SubJob.find({mainJobCategory: req.params.id}).exec();
    res.json({subJobs: subJobsFound});
  } catch (error) {
    const err = new Error('Sorry! Something went wrong. Try again.');
    next(err);
  }
}

async function getSubJob(req, res, next) {
  try {
    const subJobFound = await SubJob.findOne({
      $and:[
      {mainJobCategory: req.params.id},
      {_id: req.params.subjobdId}
      ]
    }).exec();
    if (subJobFound) {
      res.json({subJob: subJobFound});
    } else {
      res.status(400);
      const err = new Error('No subjob found.');
      next(err);
    }
  } catch (error) {
    const err = new Error('Sorry! Something went wrong. Try again.');
    next(err);
  }
}

async function createSubJob(req, res, next) {
  const result = Joi.validate(req.body, addSubJobSchema);
  if (result.error === null) {
    try {
      const subJobObj = { ...req.body, mainJobCategory: req.params.id };
      const subJobCreated = await SubJob.create(subJobObj);
      res.json({subJob: subJobCreated});
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
  getAllSubJobs,
  getSubJob,
  createSubJob
}