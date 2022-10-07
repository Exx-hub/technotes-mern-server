const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

// Note schema
const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    title: { type: String, required: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    // ticketId: { type: Number, required: true },// commented out  because of plugin auto insert and increment
  },
  {
    timestamps: true,
  }
);

// adds ticket number to noteSchema that starts from 500 and increments sequentially
noteSchema.plugin(AutoIncrement, {
  inc_field: "ticketId",
  id: "ticketNums",
  start_seq: 500,
});

module.exports = mongoose.model("Note", noteSchema);

// inc_field => key that will be added to document
// id => reference name of counter
// start_seq => where counter will start
