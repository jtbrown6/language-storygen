const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Story = require('../models/Story');
const StudyItem = require('../models/StudyItem');

/**
 * @route   GET /api/health/check
 * @desc    Check the health of the application and database
 * @access  Public
 */
router.get('/check', async (req, res) => {
  try {
    // Check MongoDB connection status
    const dbStatus = mongoose.connection.readyState;
    const dbStatusText = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }[dbStatus] || 'unknown';
    
    // Get MongoDB stats if connected
    let dbStats = null;
    let storyCount = 0;
    let studyItemCount = 0;
    
    if (dbStatus === 1) {
      try {
        // Count documents
        storyCount = await Story.countDocuments();
        studyItemCount = await StudyItem.countDocuments();
        
        // Get database stats
        const db = mongoose.connection.db;
        dbStats = await db.stats();
      } catch (error) {
        console.error('[Health Check] Error getting database stats:', error);
      }
    }
    
    // Construct the health response
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      mongodb: {
        status: dbStatusText,
        connected: dbStatus === 1,
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        counts: {
          stories: storyCount,
          studyItems: studyItemCount
        }
      },
      environment: process.env.NODE_ENV || 'development'
    };
    
    // Add database stats if available
    if (dbStats) {
      health.mongodb.stats = {
        collections: dbStats.collections,
        objects: dbStats.objects,
        avgObjSize: dbStats.avgObjSize,
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        indexes: dbStats.indexes,
        indexSize: dbStats.indexSize
      };
    }
    
    console.log(`[Health Check] MongoDB Status: ${dbStatusText.toUpperCase()}`);
    console.log(`[Health Check] Content: Stories: ${storyCount}, Study Items: ${studyItemCount}`);
    
    res.json(health);
  } catch (error) {
    console.error('[Health Check] Error:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/health/stats
 * @desc    Get database statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    // Ensure connected to MongoDB
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        error: 'MongoDB is not connected',
        status: mongoose.connection.readyState
      });
    }
    
    // Get the last 5 stories added
    const recentStories = await Story.find()
      .sort({ dateCreated: -1 })
      .limit(5)
      .select('_id parameters.scenario parameters.level dateCreated');
    
    // Get the last 5 study items added
    const recentStudyItems = await StudyItem.find()
      .sort({ dateAdded: -1 })
      .limit(5)
      .select('_id text translation dateAdded');
    
    // Get total counts
    const storyCount = await Story.countDocuments();
    const studyItemCount = await StudyItem.countDocuments();
    
    // Get daily stats
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const storiesLast24h = await Story.countDocuments({
      dateCreated: { $gte: oneDayAgo }
    });
    
    const studyItemsLast24h = await StudyItem.countDocuments({
      dateAdded: { $gte: oneDayAgo }
    });
    
    console.log(`[MongoDB Stats] Retrieved database statistics`);
    console.log(`[MongoDB Stats] Total Stories: ${storyCount}, New (24h): ${storiesLast24h}`);
    console.log(`[MongoDB Stats] Total Study Items: ${studyItemCount}, New (24h): ${studyItemsLast24h}`);
    
    res.json({
      timestamp: new Date().toISOString(),
      database: 'language-storygen',
      collections: {
        stories: {
          total: storyCount,
          addedLast24h: storiesLast24h,
          recent: recentStories
        },
        studyItems: {
          total: studyItemCount,
          addedLast24h: studyItemsLast24h,
          recent: recentStudyItems
        }
      }
    });
  } catch (error) {
    console.error('[MongoDB Stats] Error:', error);
    res.status(500).json({
      error: 'Failed to retrieve database statistics',
      message: error.message
    });
  }
});

module.exports = router;
