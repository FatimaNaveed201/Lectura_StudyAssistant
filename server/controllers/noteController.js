const Note = require('../models/noteModel'); 

exports.saveNote = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { name, timestamp, content } = req.body;

   
    await Note.deleteOne({ user: userId, name });

    const newNote = new Note({ user: userId, name, timestamp, content });
    await newNote.save();

    res.status(201).json({ message: 'Note saved successfully' });
  } catch (err) {
    console.error('Save note error:', err);
    res.status(500).json({ error: 'Failed to save note' });
  }
};

exports.getNotesByUser = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const notes = await Note.find({ user: userId });
    res.status(200).json(notes);
  } catch (err) {
    console.error('Get notes error:', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    // Find and delete note only if it belongs to the user
    const deletedNote = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!deletedNote) {
      return res.status(404).json({ error: 'Note not found or unauthorized' });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete note" });
  }
};

