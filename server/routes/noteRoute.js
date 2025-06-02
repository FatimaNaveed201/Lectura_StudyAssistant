const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/api/notes/save', authMiddleware, noteController.saveNote);
router.get('/api/notes/user', authMiddleware, noteController.getNotesByUser);
router.delete('/api/notes/:id', authMiddleware, noteController.deleteNote);

module.exports = router;
