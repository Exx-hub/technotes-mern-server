const express = require("express");

const router = express.Router();

const path = require("path");

// / at the beginning and ends with index and .html optional
// sendfile => join dirname with up one folder out of routes, go into views folder, and find index.html there
router.get("^/$|/index(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

module.exports = router;
