require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Access the in-memory data directly from controllers
// This is a one-time script to extract data before migration
try {
  // This imports the controller modules so we can access the in-memory arrays
  const storyController = require('../controllers/storyController');
  const studyListController = require('../controllers/studyListController');
  
  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Extract stories (if using old version with in-memory arrays)
  if (Array.isArray(storyController.stories)) {
    console.log(`Found ${storyController.stories.length} stories in memory`);
    fs.writeFileSync(
      path.join(dataDir, 'stories-backup.json'),
      JSON.stringify(storyController.stories, null, 2)
    );
    console.log('Stories saved to ../data/stories-backup.json');
  } else {
    console.log('No in-memory stories array found');
  }
  
  // Extract study list (if using old version with in-memory arrays)
  if (Array.isArray(studyListController.studyList)) {
    console.log(`Found ${studyListController.studyList.length} study items in memory`);
    fs.writeFileSync(
      path.join(dataDir, 'studylist-backup.json'),
      JSON.stringify(studyListController.studyList, null, 2)
    );
    console.log('Study list saved to ../data/studylist-backup.json');
  } else {
    console.log('No in-memory study list array found');
  }
  
  console.log('Data extraction completed');
} catch (error) {
  console.error('Error extracting data:', error);
}

// As a fallback, also try to extract from localStorage backups from frontend
try {
  const storiesPath = path.join(__dirname, '../../client/src/data/savedStories.json');
  const studyListPath = path.join(__dirname, '../../client/src/data/studyList.json');
  
  if (fs.existsSync(storiesPath)) {
    const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));
    fs.writeFileSync(
      path.join(__dirname, '../data/stories-backup-frontend.json'),
      JSON.stringify(stories, null, 2)
    );
    console.log('Frontend stories backup saved to ../data/stories-backup-frontend.json');
  }
  
  if (fs.existsSync(studyListPath)) {
    const studyList = JSON.parse(fs.readFileSync(studyListPath, 'utf8'));
    fs.writeFileSync(
      path.join(__dirname, '../data/studylist-backup-frontend.json'),
      JSON.stringify(studyList, null, 2)
    );
    console.log('Frontend study list backup saved to ../data/studylist-backup-frontend.json');
  }
} catch (error) {
  console.log('No frontend backups found or error accessing them');
}
