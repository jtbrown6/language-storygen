import React, { useContext, useState } from 'react';
import { StoryContext } from '../contexts/StoryContext';
import { StudyListContext } from '../contexts/StudyListContext';
import StudyList from './StudyList';
import TranslatableText from './TranslatableText';
import { FaVolumeUp, FaSave, FaLanguage, FaPlay, FaPause, FaStop, FaSpinner } from 'react-icons/fa';
import { useStoryAudio } from '../hooks/useAudio';
import { formatTime } from '../utils/audioUtils';

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
  
  // Story audio hook
  const {
    isGenerating: isGeneratingAudio,
    isPlaying: isPlayingAudio,
    isLoading: isLoadingAudio,
    currentTime,
    duration,
    progress,
    audioSupported,
    hasAudio,
    generateStoryAudio,
    play: playAudio,
    pause: pauseAudio,
    stop: stopAudio,
    seekTo,
    cleanup: cleanupAudio
  } = useStoryAudio();
  
  // Audio handlers
  const handleGenerateAudio = async () => {
    if (!currentStory?.story) return;
    
    try {
      const success = await generateStoryAudio(currentStory.story);
      if (!success) {
        console.error('Failed to generate story audio');
      }
    } catch (error) {
      console.error('Error generating story audio:', error);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (isPlayingAudio) {
        pauseAudio();
      } else {
        if (!hasAudio) {
          await handleGenerateAudio();
        }
        await playAudio();
      }
    } catch (error) {
      console.error('Error playing/pausing audio:', error);
    }
  };

  const handleStop = () => {
    stopAudio();
  };

  const handleSeek = (e) => {
    if (!duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    seekTo(newTime);
  };

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
            
            {audioSupported && (
              <div className="audio-player">
                <div className="audio-controls">
                  <button 
                    className="btn btn-secondary"
                    onClick={handlePlayPause}
                    disabled={isGeneratingAudio || isLoadingAudio}
                    title={isPlayingAudio ? 'Pause' : 'Play'}
                    style={{ marginRight: '8px' }}
                  >
                    {isGeneratingAudio || isLoadingAudio ? (
                      <FaSpinner className="fa-spin" />
                    ) : isPlayingAudio ? (
                      <FaPause />
                    ) : (
                      <FaPlay />
                    )}
                  </button>
                  
                  <button 
                    className="btn btn-secondary"
                    onClick={handleStop}
                    disabled={!hasAudio || isGeneratingAudio}
                    title="Stop"
                    style={{ marginRight: '12px' }}
                  >
                    <FaStop />
                  </button>
                  
                  <div className="audio-progress-container" style={{ flex: 1, marginRight: '12px' }}>
                    <div 
                      className="audio-progress-bar"
                      onClick={handleSeek}
                      style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: '#ddd',
                        borderRadius: '3px',
                        cursor: hasAudio ? 'pointer' : 'default',
                        position: 'relative'
                      }}
                    >
                      <div 
                        className="audio-progress-fill"
                        style={{
                          width: `${progress}%`,
                          height: '100%',
                          backgroundColor: '#396afc',
                          borderRadius: '3px',
                          transition: 'width 0.1s ease'
                        }}
                      />
                    </div>
                    
                    <div className="audio-time" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '0.75rem', 
                      color: '#666',
                      marginTop: '4px'
                    }}>
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
                
                {isGeneratingAudio && (
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: '#666', 
                    marginTop: '8px',
                    textAlign: 'center'
                  }}>
                    Generating audio...
                  </div>
                )}
              </div>
            )}
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
