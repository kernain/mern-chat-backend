const mongoose = require("mongoose");
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);



 const Users = mongoose.model('User', UserSchema)

 module.exports = Users