const mongoose = require("mongoose");

module.exports = mongoose.model("LotFile", new mongoose.Schema({
  filename: String,
  uploader: String,
  district: String,
  timestamp: Date,
  version: Number
}));
