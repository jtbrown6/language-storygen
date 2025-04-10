require('dotenv').config();
const mongoose = require('mongoose');
const Story = require('../models/Story');
const StudyItem = require('../models/StudyItem');
const fs = require('fs');
const path = require('path');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/language-storygen';

// Function to migrate data from localStorage backups (if they exist)
const migrateData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if local backup files exist
    const storiesBackupPath = path.join(__dirname, '../data/stories-backup.json');
    const studyListBackupPath = path.join(__dirname, '../data/studylist-backup.json');
    
    // Create the data directory if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, '../data'))) {
      fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
    }

    // Migrate stories if backup exists
    if (fs.existsSync(storiesBackupPath)) {
      try {
        const storiesData = JSON.parse(fs.readFileSync(storiesBackupPath, 'utf8'));
        
        if (Array.isArray(storiesData) && storiesData.length > 0) {
          console.log(`Found ${storiesData.length} stories to migrate...`);
          
          // Transform old format to match new schema
          const storiesForMigration = storiesData.map(story => ({
            story: story.story,
            parameters: story.parameters || {},
            markup: story.markup || [],
            translation: story.translation,
            dateCreated: story.dateCreated || new Date()
          }));
          
          // Insert stories into MongoDB
          const result = await Story.insertMany(storiesForMigration);
          console.log(`Successfully migrated ${result.length} stories to MongoDB`);
        } else {
          console.log('No stories found to migrate');
        }
      } catch (error) {
        console.error('Error migrating stories:', error);
      }
    } else {
      console.log('No stories backup file found');
    }
    
    // Migrate study list if backup exists
    if (fs.existsSync(studyListBackupPath)) {
      try {
        const studyListData = JSON.parse(fs.readFileSync(studyListBackupPath, 'utf8'));
        
        if (Array.isArray(studyListData) && studyListData.length > 0) {
          console.log(`Found ${studyListData.length} study items to migrate...`);
          
          // Transform old format to match new schema
          const studyItemsForMigration = studyListData.map(item => ({
            text: item.text,
            context: item.context || '',
            translation: item.translation,
            dateAdded: item.dateAdded || new Date()
          }));
          
          // Insert study items into MongoDB
          const result = await StudyItem.insertMany(studyItemsForMigration);
          console.log(`Successfully migrated ${result.length} study items to MongoDB`);
        } else {
          console.log('No study items found to migrate');
        }
      } catch (error) {
        console.error('Error migrating study items:', error);
      }
    } else {
      console.log('No study list backup file found');
    }
    
    console.log('Migration process completed');
    
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Execute migration
migrateData();
