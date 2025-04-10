const CurrentStory = require('../models/CurrentStory');

// Get the latest story for a specific device
exports.getCurrentStory = async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }
    
    // Find the most recent story for this device
    const currentStory = await CurrentStory.findOne({ deviceId })
      .sort({ timestamp: -1 })
      .limit(1);
    
    if (!currentStory) {
      return res.status(404).json({ error: 'No current story found for this device' });
    }
    
    console.log(`[MongoDB] Retrieved current story for device: ${deviceId}`);
    res.json(currentStory);
  } catch (error) {
    console.error('Error fetching current story:', error);
    res.status(500).json({ error: 'Failed to fetch current story' });
  }
};

// Save or update the current story for a device
exports.saveCurrentStory = async (req, res) => {
  try {
    const { deviceId, story, parameters, markup, translation } = req.body;
    
    if (!deviceId || !story) {
      return res.status(400).json({ error: 'Device ID and story content are required' });
    }
    
    // Create a new current story entry
    const newCurrentStory = new CurrentStory({
      deviceId,
      story,
      parameters,
      markup: markup || [],
      translation,
      timestamp: new Date()
    });
    
    const savedStory = await newCurrentStory.save();
    
    // Optionally: Remove older entries for this device to save space
    // Keep only the most recent 5 stories for each device
    const oldStories = await CurrentStory.find({ deviceId })
      .sort({ timestamp: -1 })
      .skip(5); // Skip the 5 most recent
    
    if (oldStories.length > 0) {
      const oldStoryIds = oldStories.map(story => story._id);
      await CurrentStory.deleteMany({ _id: { $in: oldStoryIds } });
      console.log(`[MongoDB] Removed ${oldStoryIds.length} older stories for device: ${deviceId}`);
    }
    
    console.log(`[MongoDB] Current story saved for device: ${deviceId}`);
    res.status(201).json(savedStory);
  } catch (error) {
    console.error('Error saving current story:', error);
    res.status(500).json({ error: 'Failed to save current story' });
  }
};

// Delete all current stories for a device (optional cleanup)
exports.deleteCurrentStories = async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }
    
    const result = await CurrentStory.deleteMany({ deviceId });
    
    console.log(`[MongoDB] Deleted ${result.deletedCount} current stories for device: ${deviceId}`);
    res.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} current stories for this device` 
    });
  } catch (error) {
    console.error('Error deleting current stories:', error);
    res.status(500).json({ error: 'Failed to delete current stories' });
  }
};
