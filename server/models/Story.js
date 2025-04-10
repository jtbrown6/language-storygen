const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
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
  dateCreated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Add indexes for better performance
StorySchema.index({ dateCreated: -1 }); // Index for sorting by date
StorySchema.index({ 'parameters.scenario': 'text' }); // Text index for searching scenarios

module.exports = mongoose.model('Story', StorySchema);
