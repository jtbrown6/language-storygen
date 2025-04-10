const StudyItem = require('../models/StudyItem');

// Controllers
exports.getStudyList = async (req, res) => {
  try {
    const studyItems = await StudyItem.find().sort({ dateAdded: -1 });
    console.log(`[MongoDB] Retrieved ${studyItems.length} study items from database`);
    res.json(studyItems);
  } catch (error) {
    console.error('Error fetching study items:', error);
    res.status(500).json({ error: 'Failed to fetch study items' });
  }
};

exports.getStudyItemById = async (req, res) => {
  try {
    const item = await StudyItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Study item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching study item:', error);
    res.status(500).json({ error: 'Failed to fetch study item' });
  }
};

exports.addStudyItem = async (req, res) => {
  try {
    const { text, context, translation } = req.body;
    
    if (!text || !translation) {
      return res.status(400).json({ error: 'Text and translation are required' });
    }
    
    // Check if item already exists to avoid duplicates
    const existingItem = await StudyItem.findOne({
      text: { $regex: new RegExp(`^${text}$`, 'i') },
      translation: { $regex: new RegExp(`^${translation}$`, 'i') }
    });
    
    if (existingItem) {
      console.log(`[MongoDB] Duplicate study item rejected: "${text}"`);
      return res.status(400).json({ 
        error: 'This item already exists in your study list',
        item: existingItem
      });
    }
    
    const newItem = new StudyItem({
      text,
      context: context || '',
      translation
    });
    
    const savedItem = await newItem.save();
    console.log(`[MongoDB] Study item saved successfully with ID: ${savedItem._id}`);
    console.log(`[MongoDB] Study item details: "${savedItem.text}" => "${savedItem.translation}"`);
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error adding study item:', error);
    res.status(500).json({ error: 'Failed to add study item' });
  }
};

exports.removeStudyItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await StudyItem.findByIdAndDelete(itemId);
    
    if (!item) {
      return res.status(404).json({ error: 'Study item not found' });
    }
    
    console.log(`[MongoDB] Study item deleted successfully: ID ${itemId}`);
    console.log(`[MongoDB] Deleted item: "${item.text}"`);
    res.json({ success: true, message: 'Study item removed successfully' });
  } catch (error) {
    console.error('Error removing study item:', error);
    res.status(500).json({ error: 'Failed to remove study item' });
  }
};
