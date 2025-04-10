import React, { useState, useContext, useEffect, useRef } from 'react';
import { StudyListContext } from '../contexts/StudyListContext';
import { StoryContext } from '../contexts/StoryContext';

const TranslatableText = ({ text, contentType = 'story' }) => {
  const { addStudyItem, translateInline } = useContext(StudyListContext);
  const { markup } = useContext(StoryContext);
  
  const [tooltip, setTooltip] = useState({ visible: false, text: '', translation: '', position: { x: 0, y: 0 } });
  const [addedMessage, setAddedMessage] = useState('');
  const [selection, setSelection] = useState({ start: -1, end: -1, text: '' });
  
  const textRef = useRef(null);
  
  // Function to format text for conversations
  const formatConversationText = (text) => {
    if (contentType !== 'conversation') return text;
    
    // Split by newlines and add proper formatting
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Check if the line has a colon (indicating speaker)
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const speaker = line.substring(0, colonIndex).trim();
        const speech = line.substring(colonIndex + 1).trim();
        return (
          <div key={i} className="conversation-line">
            <span className="conversation-speaker">{speaker}:</span>
            <span className="conversation-speech">{speech}</span>
          </div>
        );
      }
      return <div key={i}>{line}</div>;
    });
  };
  
  // Apply markup to text (no formatting per user request)
  const applyMarkupToText = (content) => {
    // Simply return the content without any formatting
    return content;
  };
  
  // Handle text selection
  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      
      if (selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();
      
      // Only process if selection is inside our component
      if (
        selectedText.length > 0 && 
        textRef.current && 
        textRef.current.contains(range.startContainer) &&
        textRef.current.contains(range.endContainer)
      ) {
        const rect = range.getBoundingClientRect();
        
        // Find surrounding context for the selected text
        const fullText = textRef.current.textContent;
        const selectionStart = fullText.indexOf(selectedText);
        const contextStart = Math.max(0, selectionStart - 50);
        const contextEnd = Math.min(fullText.length, selectionStart + selectedText.length + 50);
        const context = fullText.substring(contextStart, contextEnd);
        
        handleTranslate(selectedText, context, rect);
      }
    };
    
    document.addEventListener('mouseup', handleTextSelection);
    
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, []);
  
  // Handle translating text (used by both click and selection)
  const handleTranslate = async (text, context, rect) => {
    if (!text || text.length === 0) return;
    
    // Don't process if it's just punctuation
    if (/^[.,!?;:"'()\[\]{}]$/.test(text)) {
      return;
    }
    
    try {
      // Get translation
      const translation = await translateInline(text, context);
      
      if (translation) {
        // Show tooltip
        setTooltip({
          visible: true,
          text,
          translation,
          position: {
            x: rect.left + (rect.width / 2),
            y: rect.top
          },
          context
        });
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
  };
  
  // Handle word click (for single word selection)
  const handleWordClick = async (e) => {
    // Don't process if we're already showing a tooltip from a selection
    if (tooltip.visible) return;
    
    // Get the clicked word
    const word = e.target.textContent.trim();
    if (!word || /^\s+$|^[.,!?;:"'()\[\]{}]$/.test(word)) {
      return;
    }
    
    // Find context from surrounding text
    const container = textRef.current;
    const fullText = container.textContent;
    const wordStart = fullText.indexOf(word);
    const contextStart = Math.max(0, wordStart - 50);
    const contextEnd = Math.min(fullText.length, wordStart + word.length + 50);
    const context = fullText.substring(contextStart, contextEnd);
    
    // Use the shared translation handler
    handleTranslate(word, context, e.target.getBoundingClientRect());
  };
  
  // Handle adding to study list
  const handleAddToStudy = async () => {
    const { text, translation, context } = tooltip;
    
    const success = await addStudyItem({
      text,
      context,
      translation
    });
    
    if (success) {
      setAddedMessage('Added to study list!');
      setTimeout(() => {
        setAddedMessage('');
        setTooltip({ ...tooltip, visible: false });
      }, 2000);
    }
  };
  
  // Handle closing the tooltip
  const handleCloseTooltip = () => {
    setTooltip({ ...tooltip, visible: false });
    setAddedMessage('');
  };
  
  return (
    <div className="translatable-text" ref={textRef} onClick={handleCloseTooltip}>
      {contentType === 'conversation' ? (
        formatConversationText(text)
      ) : (
        <div className="story-text">
          {applyMarkupToText(text)}
        </div>
      )}
      
      {tooltip.visible && (
        <div
          className="tooltip-container"
          style={{
            position: 'fixed',
            left: tooltip.position.x,
            top: tooltip.position.y - 10,
            transform: 'translate(-50%, -100%)',
            zIndex: 1000,
            backgroundColor: '#333',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div><strong>{tooltip.text}</strong>: {tooltip.translation}</div>
          {addedMessage ? (
            <div style={{ color: '#4CAF50', marginTop: '5px' }}>{addedMessage}</div>
          ) : (
            <button
              onClick={handleAddToStudy}
              style={{
                background: 'transparent',
                border: '1px solid white',
                color: 'white',
                padding: '2px 5px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                marginTop: '5px',
                borderRadius: '3px'
              }}
            >
              Add to Study List
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TranslatableText;
