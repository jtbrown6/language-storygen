import React, { useContext, useState } from 'react';
import { StoryContext } from '../contexts/StoryContext';
import TranslatableText from './TranslatableText';
import { FaTrash, FaLanguage } from 'react-icons/fa';

const SavedStoriesPanel = () => {
  const { savedStories, deleteStory } = useContext(StoryContext);
  const [expandedStory, setExpandedStory] = useState(null);
  const [showTranslation, setShowTranslation] = useState({});
  
  const handleDelete = async (storyId) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      await deleteStory(storyId);
    }
  };
  
  const toggleExpand = (storyId) => {
    setExpandedStory(expandedStory === storyId ? null : storyId);
  };
  
  const toggleTranslation = (storyId) => {
    setShowTranslation({
      ...showTranslation,
      [storyId]: !showTranslation[storyId]
    });
  };
  
  return (
    <div className="saved-stories-panel">
      <h2>Saved Stories</h2>
      
      {savedStories.length === 0 ? (
        <p>You haven't saved any stories yet. Generate a story and save it to see it here.</p>
      ) : (
        <div className="saved-stories-list">
          {savedStories.map((story) => (
            <div key={story.id} className="saved-story-card">
              <div className="saved-story-header">
                <h3>{story.parameters.scenario}</h3>
                <div className="saved-story-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => toggleExpand(story.id)}
                  >
                    {expandedStory === story.id ? 'Collapse' : 'Expand'}
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(story.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <div className="saved-story-details">
                <p><strong>Level:</strong> {story.parameters.level}</p>
                <p><strong>Type:</strong> {story.parameters.contentType === 'story' ? 'Story' : 'Conversation'}</p>
                <p><strong>Date:</strong> {new Date(story.dateCreated).toLocaleDateString()}</p>
              </div>
              
              {expandedStory === story.id && (
                <div className="saved-story-content">
                  <div className="story-content">
                    <TranslatableText 
                      text={story.story} 
                      contentType={story.parameters.contentType} 
                    />
                  </div>
                  
                  {story.translation && (
                    <div>
                      <button 
                        className="btn btn-secondary translation-toggle" 
                        onClick={() => toggleTranslation(story.id)}
                      >
                        <FaLanguage style={{ marginRight: '5px' }} />
                        {showTranslation[story.id] ? 'Hide Translation' : 'Show Translation'}
                      </button>
                      
                      {showTranslation[story.id] && (
                        <div className="translation-content">
                          {story.translation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedStoriesPanel;
