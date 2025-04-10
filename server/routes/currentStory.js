const express = require('express');
const router = express.Router();
const currentStoryController = require('../controllers/currentStoryController');

/**
 * @route   GET /api/current-story/:deviceId
 * @desc    Get the current story for a specific device
 * @access  Public
 */
router.get('/:deviceId', currentStoryController.getCurrentStory);

/**
 * @route   POST /api/current-story
 * @desc    Save or update the current story for a device
 * @access  Public
 */
router.post('/', currentStoryController.saveCurrentStory);

/**
 * @route   DELETE /api/current-story/:deviceId
 * @desc    Delete all current stories for a device
 * @access  Public
 */
router.delete('/:deviceId', currentStoryController.deleteCurrentStories);

module.exports = router;
