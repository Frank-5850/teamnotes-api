const Note = require("../models/Note.js");
const User = require("../models/User.js");
const asyncHandler = require("express-async-handler");

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find().lean();

  if (!notes.length) {
    return res.status(400).json({ message: "No notes found" });
  }

  const allNotesWithUsers = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );

  res.json(allNotesWithUsers);
});

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;

  // Checks for missing fields
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Checks for duplicate note titles
  const duplicate = await Note.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  // saves note
  const note = await Note.create({ user, title, text });

  if (note) {
    // sends created note confirmations
    res.status(201).json({ message: `New note: ${title} created` });
  } else {
    res.status(400).json({ message: "Invalid note data received" });
  }
});

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  if (!id || !user || !title || !text || typeof complete !== "boolean") {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  const duplicate = await Note.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Note title already Exist" });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.json({ message: `${updatedNote.title} updated` });
});

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Note ID is Required" });
  }

  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  const result = await note.deleteOne();

  const reply = `${result.title} with ID ${result._id} was deleted`;

  res.json(reply);
});

module.exports = { getAllNotes, createNewNote, updateNote, deleteNote };
