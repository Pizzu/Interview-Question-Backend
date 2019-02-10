const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {type: String, required: true},
  imageUrl: {type: String, required: true},
  createdDate: {type: Date, default: Date.now},
});

module.exports = mongoose.model("Job", jobSchema);