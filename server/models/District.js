const mongoose = require("mongoose");

module.exports = mongoose.model("District", new mongoose.Schema({
  name: { type: String, unique: true },
  created: { type: Date, default: Date.now }
}));
