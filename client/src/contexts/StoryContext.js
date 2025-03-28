import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const StoryContext = createContext();

export const StoryProvider = ({ children }) => {
  // Current story state
  const [currentStory, setCurrentStory] = useState(null);
  const [markup, setMarkup] = useState([]);
  const [translation, setTranslation] = useState(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Saved stories
  const [savedStories, setSavedStories] = useState([]);
  
  // Load saved stories from local storage on initial load
  useEffect(() => {
    const loadSavedStories = async () => {
      try {
        const response = await axios.get('/api/story');
        setSavedStories(response.data);
      } catch (err) {
        console.error('Error loading saved stories:', err);
        // Fallback to localStorage if API fails
        const storedStories = localStorage.getItem('savedStories');
        if (storedStories) {
          setSavedStories(JSON.parse(storedStories));
        }
      }
    };
    
    loadSavedStories();
  }, []);
  
  // Save stories to localStorage whenever savedStories changes
  useEffect(() => {
    localStorage.setItem('savedStories', JSON.stringify(savedStories));
  }, [savedStories]);
  
  // Generate a story based on parameters
  const generateStory = async (parameters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Generating story with parameters:', parameters);
      const response = await axios.post('/api/story/generate', parameters);
      console.log('Story generation response:', response.data);
      
      setCurrentStory({
        story: response.data.story,
        parameters: response.data.parameters
      });
      
      // Store the markup information
      setMarkup(response.data.markup || []);
      // Clear any existing translation when generating a new story
      setTranslation(null);
      setShowTranslation(false);
    } catch (err) {
      console.error('Error generating story:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.details || 
        err.message || 
        'Failed to generate story'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Translate the current story
  const translateStory = async () => {
    if (!currentStory) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post('/api/translate/full', {
        text: currentStory.story
      });
      
      setTranslation(response.data.translation);
      setShowTranslation(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to translate story');
      console.error('Error translating story:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle translation visibility
  const toggleTranslation = () => {
    if (translation) {
      setShowTranslation(!showTranslation);
    } else if (currentStory) {
      translateStory();
    }
  };
  
  // Save the current story
  const saveStory = async () => {
    if (!currentStory) return;
    
    try {
      const storyData = {
        story: currentStory.story,
        parameters: currentStory.parameters,
        translation: translation
      };
      
      const response = await axios.post('/api/story/save', storyData);
      
      setSavedStories([...savedStories, response.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save story');
      console.error('Error saving story:', err);
      return null;
    }
  };
  
  // Delete a saved story
  const deleteStory = async (storyId) => {
    try {
      await axios.delete(`/api/story/${storyId}`);
      setSavedStories(savedStories.filter(story => story.id !== storyId));
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete story');
      console.error('Error deleting story:', err);
      return false;
    }
  };
  
  // Get a random scenario
  const getRandomScenario = async () => {
    try {
      const response = await axios.get('/api/story/random-scenario');
      return response.data.scenario;
    } catch (err) {
      console.error('Error fetching random scenario:', err);
      // Fallback to a default scenario
      return 'Un día en la playa';
    }
  };
  
  return (
    <StoryContext.Provider
      value={{
        currentStory,
        setCurrentStory,
        markup,
        setMarkup,
        translation,
        showTranslation,
        isLoading,
        error,
        savedStories,
        generateStory,
        translateStory,
        toggleTranslation,
        saveStory,
        deleteStory,
        getRandomScenario
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};
