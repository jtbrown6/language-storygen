// In-memory storage for study list (in a real app, this would be a database)
let studyList = [];
let studyItemIdCounter = 1;

// Controllers
exports.getStudyList = (req, res) => {
  res.json(studyList);
};

exports.getStudyItemById = (req, res) => {
  const item = studyList.find(item => item.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'Study item not found' });
  }
  res.json(item);
};

exports.addStudyItem = (req, res) => {
  const { text, context, translation } = req.body;
  
  if (!text || !translation) {
    return res.status(400).json({ error: 'Text and translation are required' });
  }
  
  // Check if item already exists to avoid duplicates
  const existingItem = studyList.find(item => 
    item.text.toLowerCase() === text.toLowerCase() && 
    item.translation.toLowerCase() === translation.toLowerCase()
  );
  
  if (existingItem) {
    return res.status(400).json({ 
      error: 'This item already exists in your study list',
      item: existingItem
    });
  }
  
  const newItem = {
    id: studyItemIdCounter++,
    text,
    context: context || '',
    translation,
    dateAdded: new Date().toISOString()
  };
  
  studyList.push(newItem);
  res.status(201).json(newItem);
};

exports.removeStudyItem = (req, res) => {
  const itemId = parseInt(req.params.id);
  const initialLength = studyList.length;
  studyList = studyList.filter(item => item.id !== itemId);
  
  if (studyList.length === initialLength) {
    return res.status(404).json({ error: 'Study item not found' });
  }
  
  res.json({ success: true, message: 'Study item removed successfully' });
};
