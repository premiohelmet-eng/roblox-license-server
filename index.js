const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

// ================================
// CONFIG
// ================================
const PORT = process.env.PORT || 3000;

// In-memory license store (FREE OPTION)
// ⚠️ resets if server restarts
const licenses = {
  "ABC-123-DEF": {
    userId: null,   // locked Roblox UserId
    active: true
  }
};

// ================================
// ROOT ROUTE (health check)
// ================================
app.get("/", (req, res) => {
  res.send("License server is running");
});

// ================================
// LICENSE VERIFY ROUTE
// Roblox calls this
// ================================
app.get("/verify", (req, res) => {
  const { key, userId } = req.query;

  if (!key || !userId) {
    return res.status(400).json({
      success: false,
      message: "Missing key or userId"
    });
  }

  const license = licenses[key];

  if (!license) {
    return res.status(403).json({
      success: false,
      message: "Invalid license key"
    });
  }

  if (!license.active) {
    return res.status(403).json({
      success: false,
      message: "License disabled"
    });
  }

  // First use → lock to UserId
  if (license.userId === null) {
    license.userId = userId;
    return res.json({
      success: true,
      message: "License activated"
    });
  }

  // Already locked → check UserId
  if (license.userId !== userId) {
    return res.status(403).json({
      success: false,
      message: "License already in use"
    });
  }

  // Valid
  return res.json({
    success: true,
    message: "License valid"
  });
});

// ================================
// START SERVER
// ================================
app.listen(PORT, () => {
  console.log(`License server running on port ${PORT}`);
});
