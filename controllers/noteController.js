const Note = require("../models/Note");
const User = require("../models/User");

// description - GET all notes
// route - GET /notes
// access - Private
const getAllNotes = async (req, res) => {
  const cookies = req.cookies;
  console.log("cookies:", cookies);
  // fetch all notes
  const notes = await Note.find().lean();
  // console.log(notes);

  // validation
  if (notes && !notes.length) {
    return res.status(400).json({ message: "No notes found." });
  }

  // promise.all to attach username to note
  //basically gets userId in note, finds each user with userid and creates new object
  // passing in the note and adding username key with found user
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      // console.log("user:", user)
      return { ...note, username: user.username };
    })
  );

  return res.status(200).json(notesWithUser);
};

// description - CREATE a new Note
// route - POST /notes
// access - Private
const createNote = async (req, res) => {
  const { user, title, text } = req.body;

  // Confirm data
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  // Create and store the new user
  const note = await Note.create({ user, title, text });

  if (note) {
    // Created
    return res.status(201).json({ message: "New note created" });
  } else {
    return res.status(400).json({ message: "Invalid note data received" });
  }
};

// description - UPDATE new Note
// route - PATCH /notes
// access - Private
const updateNote = async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  // Confirm data
  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm note exists to update
  const note = await Note.findById(id).exec(); // why use object id when ticketId is avaiable

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec(); // why use title when ticketid is unique

  // Allow renaming of the original note
  if (duplicate && duplicate._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.json(`'${updatedNote.title}' updated`);
};

// description - DELETE a Note
// route - DELETE /notes
// access - Private
const deleteNote = async (req, res) => {
  const { id } = req.body; // note object id. why not use ticketid?

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Note ID required" });
  }

  // Confirm note exists to delete
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  const result = await note.deleteOne();

  const reply = `Note '${result.title}' with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = { getAllNotes, createNote, updateNote, deleteNote };

// my implementation of create. his way uses title and title should be unique
// his way passes user id to create, mine just uses username.

// const { username, title, text } = req.body;

//   // confirm data
//   if (!username || !title || !text) {
//     return res.status(400).json({ message: "All fields are required!" });
//   }

//   // Check for duplicate title
//   const duplicate = await Note.findOne({ title }).lean().exec();

//   if (duplicate) {
//     return res.status(409).json({ message: "Duplicate note title" });
//   }

//   // find user
//   const user = await User.findOne({ username }).lean();

//   if (!user) {
//     return res.status(400).json({ message: "User not found." });
//   }

//   let newNote = new Note({
//     user: user._id,
//     title,
//     text,
//   });

//   const createdNote = await Note.create(newNote);

//   if (createNote) {
//     res
//       .status(201)
//       .json({ message: `New Note Created - ID: ${createdNote._id}` });
//   } else {
//     res.status(400).json({ message: "Invalid user data received." });
//   }

// my way of updating note

//  // get data from body
//  const { username, title, text, ticketId, completed } = req.body;

//  // validation
//  if (
//    !username ||
//    !title ||
//    !text ||
//    !ticketId ||
//    typeof completed !== "boolean"
//  ) {
//    return res.status(400).json({ message: "All fields are required!" });
//  }

//  // check if new user exists
//  const newUser = await User.findOne({ username }).lean();

//  if (!newUser) {
//    return res.status(400).json({ message: "User not found." });
//  }
//  // check if note exists
//  const noteToUpdate = await Note.findOne({ ticketId }).exec();

//  if (!noteToUpdate) {
//    return res
//      .status(400)
//      .json({ message: `Note with ticketId: ${ticketId} -- not found.` });
//  }

// noteToUpdate.user = newUser._id;
//  noteToUpdate.completed = completed;
//  noteToUpdate.text = text;
//  noteToUpdate.title = title;

//  await noteToUpdate.save();

//  // return backend response
//  res.json({ message: `Note updated` });

// MY WAY OF DELETING, IDK WHY ticketId was not used when it is there. maybe opinionated

//  // get data from body
//  const { ticketId } = req.body;

//  // data validation
//  if (!ticketId) {
//    return res.status(400).json({ message: "All fields required." });
//  }

//  // check if note to delete exists
//  const noteToDelete = await Note.findOne({ ticketId }).exec();

//  if (!noteToDelete) {
//    return res.status(400).json({ message: "Note not found." });
//  }

//  await noteToDelete.deleteOne();
//  res
//    .status(200)
//    .json({ message: `Note with Ticket ID: ${ticketId} - deleted. ` });
