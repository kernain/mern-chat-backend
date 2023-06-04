const mongoose = require("mongoose");
const jwt = require('jsonwebtoken')

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    text: { type: String},
  },
  { timestamps: true }
);


 const Messages = mongoose.model('Messages', MessageSchema)

 module.exports = Messages