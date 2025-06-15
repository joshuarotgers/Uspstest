const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Load JWT Secret directly from environment variable (Render / Railway compatible)
const jwtSecret = process.env.JWT_SECRET;

// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Models
const User = require("./models/User");
const District = require("./models/District");
const LotFile = require("./models/LotFile");

// File storage (local directory only for file metadata)
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

const fs = require("fs");
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// Auth middleware
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// TEMP registration for HQ (first-time use)
app.post("/register", async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);
  const user = new User({
    username: req.body.username,
    password: hashed,
    role: req.body.role,
    district: req.body.district
  });
  await user.save();
  res.json({ message: "User registered" });
});

// HQ district creation
app.post("/district", verifyToken, async (req, res) => {
  if (req.user.role !== "hq") return res.sendStatus(403);
  const district = new District({ name: req.body.name });
  await district.save();
  res.json({ message: "District created" });
});

// Login
app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.sendStatus(401);
  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.sendStatus(401);
  const token = jwt.sign({
    username: user.username,
    role: user.role,
    district: user.district
  }, jwtSecret);
  res.json({ token });
});

// File upload
app.post("/upload", verifyToken, upload.single("lotFile"), async (req, res) => {
  const file = new LotFile({
    filename: req.file.filename,
    uploader: req.user.username,
    district: req.user.district,
    timestamp: new Date(),
    version: 1
  });
  await file.save();
  res.json({ message: "File uploaded" });
});

// Get files (district filtering)
app.get("/files", verifyToken, async (req, res) => {
  let files;
  if (req.user.role === "hq") {
    files = await LotFile.find().sort({ timestamp: -1 });
  } else {
    files = await LotFile.find({ district: req.user.district }).sort({ timestamp: -1 });
  }
  res.json(files);
});

// File download (optional)
app.get("/download/:filename", verifyToken, (req, res) => {
  res.download(__dirname + "/uploads/" + req.params.filename);
});

// HQ Reporting
app.get("/reporting/summary", verifyToken, async (req, res) => {
  if (req.user.role !== "hq") return res.sendStatus(403);

  const totalUsers = await User.countDocuments();
  const totalFiles = await LotFile.countDocuments();
  const districts = await District.find();

  const districtStats = await Promise.all(
    districts.map(async (dist) => {
      const count = await LotFile.countDocuments({ district: dist.name });
      return { district: dist.name, lotFiles: count };
    })
  );

  res.json({
    totalUsers,
    totalFiles,
    districts: districtStats
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`USPS LOT NAV V11 Server running on port ${PORT}`));
