const mongoose = require("mongoose");

module.exports = mongoose.model("User", new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["carrier", "supervisor", "district-admin", "hq"] },
  district: String
}));
