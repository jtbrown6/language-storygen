const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');

/**
 * @route   POST /api/story/generate
 * @desc    Generate a story based on parameters
 * @access  Public
 */
router.post('/generate', storyController.generateStory);

/**
 * @route   GET /api/story
 * @desc    Get all saved stories
 * @access  Public
 */
router.get('/', storyController.getStories);

/**
 * @route   GET /api/story/:id
 * @desc    Get a story by ID
 * @access  Public
 */
router.get('/:id', storyController.getStoryById);

/**
 * @route   POST /api/story/save
 * @desc    Save a story
 * @access  Public
 */
router.post('/save', storyController.saveStory);

/**
 * @route   DELETE /api/story/:id
 * @desc    Delete a story
 * @access  Public
 */
router.delete('/:id', storyController.deleteStory);

/**
 * @route   GET /api/story/random-scenario
 * @desc    Get a random scenario
 * @access  Public
 */
router.get('/random-scenario', storyController.getRandomScenario);

module.exports = router;
