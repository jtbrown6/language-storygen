const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');

/**
 * @route   POST /api/audio/pronounce
 * @desc    Generate pronunciation audio for a word or phrase
 * @access  Public
 */
router.post('/pronounce', audioController.pronounceText);

/**
 * @route   POST /api/audio/story
 * @desc    Generate audio for a full story
 * @access  Public
 */
router.post('/story', audioController.generateStoryAudio);

module.exports = router;
