import React, { useContext, useState } from 'react';
import { StoryContext } from '../contexts/StoryContext';
import { StudyListContext } from '../contexts/StudyListContext';
import StudyList from './StudyList';
import TranslatableText from './TranslatableText';
import { FaVolumeUp, FaSave, FaLanguage } from 'react-icons/fa';

const StoryPanel = () => {
  const { 
    currentStory, 
    translation, 
    showTranslation, 
    toggleTranslation, 
    saveStory,
    isLoading,
    error
  } = useContext(StoryContext);
  
  const [saveMessage, setSaveMessage] = useState(null);
  
  const handleSaveStory = async () => {
    const result = await saveStory();
    if (result) {
      setSaveMessage('Story saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };
  
  return (
    <div className="panel left-panel">
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>
          {error}
        </div>
      )}
      
      {saveMessage && (
        <div className="success-message" style={{ color: 'green', marginBottom: '15px' }}>
          {saveMessage}
        </div>
      )}
      
      {isLoading ? (
        <div className="loading">
          <p>Loading...</p>
        </div>
      ) : currentStory ? (
        <div className="story-container">
          <div className="story-content">
            <TranslatableText 
              text={currentStory.story} 
              contentType={currentStory.parameters.contentType} 
            />
          </div>
          
          {translation && showTranslation && (
            <div className="translation-content">
              {translation}
            </div>
          )}
          
          <div className="story-actions">
            <button className="btn btn-secondary" onClick={toggleTranslation} style={{ marginRight: '10px' }}>
              <FaLanguage style={{ marginRight: '5px' }} />
              {translation ? (showTranslation ? 'Hide Translation' : 'Show Translation') : 'Translate'}
            </button>
            
            <button className="btn btn-primary" onClick={handleSaveStory}>
              <FaSave style={{ marginRight: '5px' }} />
              Save Story
            </button>
            
            <div className="audio-player">
              <button className="btn" disabled title="Audio feature coming soon">
                <FaVolumeUp />
              </button>
              <span>Audio coming soon</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>Generate a story using the controls on the right.</p>
        </div>
      )}
      
      <StudyList />
    </div>
  );
};

export default StoryPanel;
