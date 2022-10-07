const express = require("express");
const { login, refresh, logout } = require("../controllers/authController");
const router = express.Router();
// const authController = require();
const loginLimiter = require("../middleware/loginLimiter");

// use loginLimiter here when login endpoint is called, middleware will be fired then your login callback
router.route("/").post(loginLimiter, login);

router.route("/refresh").get(refresh);

router.route("/logout").post(logout);

module.exports = router;
