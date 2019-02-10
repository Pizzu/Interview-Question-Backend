const mongoose = require('mongoose');
const md5 = require('md5');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {type: String, unique: true, required: true},
  email: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  avatar: {type: String},
  joinDate: {type: Date, default: Date.now},
  questions: {type: [mongoose.Schema.Types.ObjectId], ref: 'Question', required: true},
  favorites: {type: [mongoose.Schema.Types.ObjectId], ref: 'Question', required: true}
});

userSchema.pre('save', function(next) {
  this.avatar = `http://gravatar.com/avatar/${md5(this.username)}?d=identicon`;
  next();  
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  bcrypt.hash(this.password, 12, (err, hash) => {
    if (err) {
      return next(err);
    }
    this.password = hash;
    next();
  })
});

module.exports = mongoose.model('User', userSchema);