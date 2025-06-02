const express = require('express');
const multer = require('multer');
const { processLecture } = require('../controllers/lectureController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('lectureFile'), processLecture);

module.exports = router;
