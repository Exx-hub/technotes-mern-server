const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createNewUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;

// way that i did my old full stack app

// router.get("/", (req, res) => res.send("user route"));
// router.get("/register", userController.register);
