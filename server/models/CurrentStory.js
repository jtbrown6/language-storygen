const mongoose = require('mongoose');

const CurrentStorySchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true // Added index for faster lookup by deviceId
  },
  story: {
    type: String,
    required: true
  },
  parameters: {
    scenario: String,
    contentType: String,
    verbs: [String],
    indirectObjectLevel: Number,
    reflexiveVerbLevel: Number,
    idiomaticExpressions: Boolean,
    level: String
  },
  markup: [
    {
      type: {
        type: String,
        enum: ['selected-verb', 'reflexive-verb', 'idiom', 'verb']
      },
      start: Number,
      end: Number,
      text: String
    }
  ],
  translation: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Create a compound index on deviceId and timestamp for efficient retrieval of latest story
CurrentStorySchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('CurrentStory', CurrentStorySchema);
