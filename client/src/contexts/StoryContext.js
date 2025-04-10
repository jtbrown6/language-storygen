import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getDeviceId } from '../utils/deviceId';

export const StoryContext = createContext();

export const StoryProvider = ({ children }) => {
  // Device identification for sync across devices
  const deviceId = getDeviceId();
  
  // Current story state
  const [currentStory, setCurrentStory] = useState(null);
  const [markup, setMarkup] = useState([]);
  const [translation, setTranslation] = useState(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Saved stories
  const [savedStories, setSavedStories] = useState([]);
  
  // Load saved stories and current story on initial load
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load saved stories
        const savedStoriesResponse = await axios.get('/api/story');
        setSavedStories(savedStoriesResponse.data);
        
        // Load current story if it exists
        try {
          const currentStoryResponse = await axios.get(`/api/current-story/${deviceId}`);
          const latestStory = currentStoryResponse.data;
          
          // Only set if we don't already have a current story
          if (!currentStory && latestStory) {
            console.log('Loading current story from database');
            setCurrentStory({
              story: latestStory.story,
              parameters: latestStory.parameters
            });
            setMarkup(latestStory.markup || []);
            
            // Also set translation if it exists
            if (latestStory.translation) {
              setTranslation(latestStory.translation);
              setShowTranslation(true);
            }
          }
        } catch (err) {
          // It's okay if there's no current story
          if (err.response?.status !== 404) {
            console.error('Error loading current story:', err);
          }
        }
      } catch (err) {
        console.error('Error loading saved stories:', err);
        // Fallback to localStorage if API fails
        const storedStories = localStorage.getItem('savedStories');
        if (storedStories) {
          setSavedStories(JSON.parse(storedStories));
        }
      }
    };
    
    loadData();
  }, []);
  
  // Save stories to localStorage whenever savedStories changes
  useEffect(() => {
    localStorage.setItem('savedStories', JSON.stringify(savedStories));
  }, [savedStories]);
  
  // Save current story to database whenever it changes
  useEffect(() => {
    const saveCurrentStoryToDb = async () => {
      if (!currentStory) return;
      
      try {
        // Save current story to database
        await axios.post('/api/current-story', {
          deviceId,
          story: currentStory.story,
          parameters: currentStory.parameters,
          markup,
          translation
        });
        console.log('Current story saved to database');
      } catch (err) {
        console.error('Error saving current story to database:', err);
        // Non-critical error, so don't show to user
      }
    };
    
    // Only save if we have a current story
    if (currentStory) {
      saveCurrentStoryToDb();
    }
  }, [currentStory, markup, translation, deviceId]);
  
  // Generate a story based on parameters
  const generateStory = async (parameters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Generating story with parameters:', parameters);
      const response = await axios.post('/api/story/generate', parameters);
      console.log('Story generation response:', response.data);
      
      const newStory = {
        story: response.data.story,
        parameters: response.data.parameters
      };
      
      // Update state with the new story
      setCurrentStory(newStory);
      
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
      
      const newTranslation = response.data.translation;
      setTranslation(newTranslation);
      setShowTranslation(true);
      
      // Also update current story with translation
      try {
        await axios.post('/api/current-story', {
          deviceId,
          story: currentStory.story,
          parameters: currentStory.parameters,
          markup,
          translation: newTranslation
        });
        console.log('Current story updated with translation');
      } catch (err) {
        console.error('Error updating current story with translation:', err);
      }
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
      setSavedStories(savedStories.filter(story => story._id !== storyId));
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
      // Clear any previous error
      setError(null);
      
      console.log('Fetching random scenario from API...');
      const response = await axios.get('/api/story/random-scenario');
      console.log('Random scenario received:', response.data.scenario);
      return response.data.scenario;
    } catch (err) {
      console.error('Error fetching random scenario:', err);
      setError('Failed to get random scenario. Using default instead.');
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
