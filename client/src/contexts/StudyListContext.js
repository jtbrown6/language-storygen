import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const StudyListContext = createContext();

export const StudyListProvider = ({ children }) => {
  const [studyList, setStudyList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Load study list from API on initial load
  useEffect(() => {
    const loadStudyList = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/study-list');
        setStudyList(response.data);
      } catch (err) {
        console.error('Error loading study list:', err);
        // Fallback to localStorage if API fails
        const storedStudyList = localStorage.getItem('studyList');
        if (storedStudyList) {
          setStudyList(JSON.parse(storedStudyList));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStudyList();
  }, []);
  
  // Save study list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('studyList', JSON.stringify(studyList));
  }, [studyList]);
  
  // Add a word or phrase to the study list
  const addStudyItem = async (item) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if item already exists
      const exists = studyList.some(
        existingItem => 
          existingItem.text.toLowerCase() === item.text.toLowerCase() &&
          existingItem.translation.toLowerCase() === item.translation.toLowerCase()
      );
      
      if (exists) {
        setError('This item already exists in your study list');
        return false;
      }
      
      const response = await axios.post('/api/study-list', item);
      setStudyList([...studyList, response.data]);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add item to study list');
      console.error('Error adding study item:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remove an item from the study list
  const removeStudyItem = async (itemId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.delete(`/api/study-list/${itemId}`);
      setStudyList(studyList.filter(item => item.id !== itemId));
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove item from study list');
      console.error('Error removing study item:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Translate a word or phrase
  const translateInline = async (text, context = '') => {
    setError(null);
    
    try {
      const response = await axios.post('/api/translate/inline', { text, context });
      return response.data.translation;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to translate text');
      console.error('Error translating text:', err);
      return null;
    }
  };
  
  return (
    <StudyListContext.Provider
      value={{
        studyList,
        isLoading,
        error,
        addStudyItem,
        removeStudyItem,
        translateInline
      }}
    >
      {children}
    </StudyListContext.Provider>
  );
};
