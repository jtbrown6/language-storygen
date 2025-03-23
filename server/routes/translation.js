const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');

/**
 * @route   POST /api/translate/inline
 * @desc    Translate a word or phrase
 * @access  Public
 */
router.post('/inline', translationController.translateInline);

/**
 * @route   POST /api/translate/full
 * @desc    Translate a full story
 * @access  Public
 */
router.post('/full', translationController.translateFull);

module.exports = router;
