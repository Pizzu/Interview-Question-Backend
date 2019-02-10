const mongoose = require('mongoose');

const subJobSchema = new mongoose.Schema({
  title: {type: String, required: true},
  imageUrl: {type: String, required: true},
  mainJobCategory: {type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true},
  createdDate: {type: Date, default: Date.now},
});

module.exports = mongoose.model("SubJob", subJobSchema);