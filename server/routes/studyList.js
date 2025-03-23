const express = require('express');
const router = express.Router();
const studyListController = require('../controllers/studyListController');

/**
 * @route   GET /api/study-list
 * @desc    Get all study list items
 * @access  Public
 */
router.get('/', studyListController.getStudyList);

/**
 * @route   POST /api/study-list
 * @desc    Add an item to the study list
 * @access  Public
 */
router.post('/', studyListController.addStudyItem);

/**
 * @route   DELETE /api/study-list/:id
 * @desc    Remove an item from the study list
 * @access  Public
 */
router.delete('/:id', studyListController.removeStudyItem);

/**
 * @route   GET /api/study-list/:id
 * @desc    Get a study item by ID
 * @access  Public
 */
router.get('/:id', studyListController.getStudyItemById);

module.exports = router;
