const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {type: String, required: true},
  description: {type: String, required: true},
  createdDate: {type: Date, default: Date.now},
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  mainJobCategory: {type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true},
  mainSubJobCategory: {type: mongoose.Schema.Types.ObjectId, ref: 'SubJob', required: true},
});

module.exports = mongoose.model("Question", questionSchema);