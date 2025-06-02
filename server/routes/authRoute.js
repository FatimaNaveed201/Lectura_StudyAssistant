const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const noteController = require('../controllers/noteController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.delete("/:id", authMiddleware, noteController.deleteNote);


module.exports = router;