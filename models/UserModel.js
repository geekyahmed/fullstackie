const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  fullname: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  bio: {
    type: String
  },

  profilepic: {
    type: String,
    default: ""
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  country: {
    type: String
  },
  postalcode: {
    type: String
  },
  email: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  }
});

module.exports = { User: mongoose.model("user", UserSchema) };
