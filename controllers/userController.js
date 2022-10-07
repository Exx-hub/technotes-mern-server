const User = require("../models/User");
const Note = require("../models/Note");
const bcrypt = require("bcrypt");

// description - GET all users
// route - GET /users
// access - Private
const getAllUsers = async (req, res) => {
  // const roles = req.roles;
  // console.log(roles)

  // if(!roles.includes('Manager')) return res.status(403).json({message: "unauthorized access"})

  const cookies = req.cookies; // confiremed.. sent from client automatically..
  console.log("cookies:", cookies);

  const users = await User.find().select("-password").lean();

  if (users && !users.length) {
    return res.status(400).json({ message: "No users found" });
  }

  res.status(200).json({
    message: "Success",
    data: users,
  });
};

// description - Create New User
// route - POST /users
// access - Private
const createNewUser = async (req, res) => {
  // get info from body
  const { username, password, roles } = req.body;

  // validate data from body
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Check for duplicates, checking if username already exists
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "User already exists." });
  }

  // encrypt password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create new user object
  let newUser = new User({
    username,
    password: hashedPassword,
    roles,
  });

  // save to database, create method used instead of save. check what is the difference
  const createdUser = await User.create(newUser);

  if (createdUser) {
    res.status(201).json({ message: `New User ${username} created.` });
  } else {
    res.status(400).json({ message: "Invalid user data received." });
  }
};

// description - Update a user
// route - PATCH /users
// access - Private
const updateUser = async (req, res) => {
  // are all these required?
  const { id, username, roles, active, password } = req.body;

  // Confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res
      .status(400)
      .json({ message: "All fields except password are required" });
  }

  // Check if user to update exists
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User Not Found." });
  }

  // Check for duplicate
  const duplicate = await User.findOne({ username }).lean().exec();

  // Allow updates to the original user
  if (duplicate && duplicate._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  // question is if you update a user, you need to update all properties?? it seems..
  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    // Hash password
    user.password = await bcrypt.hash(password, 10); // salt rounds
  }

  // save updates to user
  const updatedUser = await user.save();

  // return backend response
  res.json({ message: `${updatedUser.username} updated` });
};

// description - Delete a user
// route - DELETE /users
// access - Private
const deleteUser = async (req, res) => {
  // find user
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }

  // Does the user still have assigned notes?
  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    return res.status(400).json({ message: "User has assigned notes" });
  }

  // Does the user to delete exists?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // delete user
  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  // return response
  res.json(reply);
};

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser };

// lean is chained if you do not want the methods attached to mongoose docs queries
// if you will not use methods like save etc, you can use lean.
// exec executes the query without waiting for the full document to be returned?
