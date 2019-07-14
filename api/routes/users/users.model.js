const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: 1,
    required: [true, 'User must have an username.']
  },
  password: {
    type: String,
    minlength: 1,
    required: [true, 'User must have an password.']
  },
  email: {
    type: String,
    minlength: 1,
    required: [true, 'User must have an email.']
  },
})

module.exports = mongoose.model("user", userSchema)