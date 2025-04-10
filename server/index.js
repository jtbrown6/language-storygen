require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

// Import routes
const storyRoutes = require('./routes/story');
const translationRoutes = require('./routes/translation');
const studyListRoutes = require('./routes/studyList');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/language-storygen';

console.log(`[MongoDB] Attempting to connect to: ${MONGODB_URI}`);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('[MongoDB] Connection established successfully');
    console.log('[MongoDB] Database: language-storygen');
    
    // Log the database connection status
    mongoose.connection.on('connected', () => {
      console.log('[MongoDB] Connection is active and ready');
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('[MongoDB] Connection disconnected');
      console.log('[MongoDB] Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB] Successfully reconnected to database');
    });
    
    // Log database operations in development mode
    if (process.env.NODE_ENV !== 'production') {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        console.log(`[MongoDB Debug] ${collectionName}.${method}`, JSON.stringify(query), doc);
      });
    }
  })
  .catch(err => {
    console.error('[MongoDB] Connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/story', storyRoutes);
app.use('/api/translate', translationRoutes);
app.use('/api/study-list', studyListRoutes);
app.use('/api/health', healthRoutes);

// Handle production build
if (process.env.NODE_ENV === 'production') {
  // Serve static files
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Handle SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
