const connectToDatabase = require('../db');
const Job = require('../models/job');
const Joi = require('joi');

const addJobSchema = Joi.object().keys({
  title: Joi.string().min(2).max(30).required(),
  imageUrl: Joi.string().uri().trim().required(),
});

module.exports.getAllJobs = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase()
    const session = await getAllJobs();
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

module.exports.getJob = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase()
    const session = await getJob(event.pathParameters.id);
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

module.exports.createJob = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectToDatabase()
    const session = await createJob(JSON.parse(event.body));
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

async function getAllJobs() {
  try {
    const jobsFound = await Job.find({}).sort({title: 1}).exec();
    return {jobs: jobsFound};
  } catch (error) {
    throw error;
  }
};

async function getJob(jobId) {
  try {
    const jobFound = await Job.findOne({_id: jobId}).exec();
    if (jobFound) {
      return {job: jobFound};
    } else {
      const err = new Error('No job found.');
      err.statusCode = 400
      throw err
    }
  } catch (error) {
    throw error
  }
};

async function createJob(eventBody) {
  const result = Joi.validate(eventBody, addJobSchema);
  if (result.error === null) {
    try {
      const jobCreated = await Job.create(eventBody);
      return {job: jobCreated};
    } catch (error) {
      throw error;
    }
  } else {
    throw result.error
  }
};