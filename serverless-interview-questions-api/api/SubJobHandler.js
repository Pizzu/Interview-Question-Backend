const connectToDatabase = require('../db');
const SubJob = require('../models/subJob');
const Joi = require('joi');

const addSubJobSchema = Joi.object().keys({
  title: Joi.string().min(2).max(30).required(),
  imageUrl: Joi.string().uri().trim().required(),
});

module.exports.getAllSubJobs = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase()
    const session = await getAllSubJobs(event.pathParameters.id);
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

module.exports.getSubJob = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase()
    const session = await getSubJob(event.pathParameters.id, event.pathParameters.subJobId);
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

module.exports.createSubJob = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase()
    const session = await createSubJob(JSON.parse(event.body), event.pathParameters.id);
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

async function getAllSubJobs(jobId) {
  try {
    const subJobsFound = await SubJob.find({mainJobCategory: jobId}).sort({title: 1}).exec();
    return {subJobs: subJobsFound};
  } catch (error) {
    throw error;
  }
}

async function getSubJob(jobId, subJobId) {
  try {
    const subJobFound = await SubJob.findOne({
      $and:[
      {mainJobCategory: jobId},
      {_id: subJobId}
      ]
    }).exec();
    if (subJobFound) {
      return {subJob: subJobFound};
    } else {
      const err = new Error('No subjob found.');
      err.statusCode = 400
      throw err;
    }
  } catch (error) {
    throw error;
  }
}

async function createSubJob(eventBody, jobId) {
  const result = Joi.validate(eventBody, addSubJobSchema);
  if (result.error === null) {
    try {
      const subJobObj = { ...eventBody, mainJobCategory: jobId };
      const subJobCreated = await SubJob.create(subJobObj);
      return {subJob: subJobCreated};
    } catch (error) {
      throw error;
    }
  } else {
    throw result.error;
  }
}
