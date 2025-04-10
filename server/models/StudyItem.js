const mongoose = require('mongoose');

const StudyItemSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  context: {
    type: String,
    default: ''
  },
  translation: {
    type: String,
    required: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Add indexes for better performance
StudyItemSchema.index({ dateAdded: -1 }); // Index for sorting by date
StudyItemSchema.index({ text: 'text', translation: 'text' }); // Text indexes for searching

module.exports = mongoose.model('StudyItem', StudyItemSchema);
