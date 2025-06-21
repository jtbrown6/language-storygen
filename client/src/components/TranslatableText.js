import React, { useState, useContext, useEffect, useRef } from 'react';
import { StudyListContext } from '../contexts/StudyListContext';
import { StoryContext } from '../contexts/StoryContext';
import { usePronunciationAudio } from '../hooks/useAudio';
import { FaVolumeUp, FaSpinner } from 'react-icons/fa';

const TranslatableText = ({ text, contentType = 'story' }) => {
  const { addStudyItem, translateInline } = useContext(StudyListContext);
  const { markup } = useContext(StoryContext);
  
  const [tooltip, setTooltip] = useState({ visible: false, text: '', translation: '', position: { x: 0, y: 0 } });
  const [addedMessage, setAddedMessage] = useState('');
  const [selection, setSelection] = useState({ start: -1, end: -1, text: '' });
  const [touchState, setTouchState] = useState({
    startTime: 0,
    startPos: { x: 0, y: 0 },
    lastTap: 0,
    tapCount: 0,
    isLongPress: false,
    longPressTimer: null
  });
  
  const textRef = useRef(null);
  
  // Audio hook for pronunciation
  const {
    isGenerating: isGeneratingAudio,
    isPlaying: isPlayingAudio,
    playPronunciation,
    audioSupported
  } = usePronunciationAudio();
  
  // Mobile device detection
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
  };
  
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
  
  // Touch event handlers for mobile
  const handleTouchStart = (e) => {
    if (!textRef.current) return;
    
    const touch = e.touches[0];
    const now = Date.now();
    
    // Clear any existing long press timer
    if (touchState.longPressTimer) {
      clearTimeout(touchState.longPressTimer);
    }
    
    // Detect double tap
    const timeSinceLastTap = now - touchState.lastTap;
    const isDoubleTap = timeSinceLastTap < 300 && touchState.tapCount === 1;
    
    setTouchState(prev => ({
      ...prev,
      startTime: now,
      startPos: { x: touch.clientX, y: touch.clientY },
      lastTap: now,
      tapCount: isDoubleTap ? 2 : 1,
      isLongPress: false,
      longPressTimer: setTimeout(() => {
        setTouchState(current => ({ ...current, isLongPress: true }));
        handleLongPress(e);
      }, 500)
    }));
  };
  
  const handleTouchEnd = (e) => {
    if (!textRef.current) return;
    
    const now = Date.now();
    const touchDuration = now - touchState.startTime;
    
    // Clear long press timer
    if (touchState.longPressTimer) {
      clearTimeout(touchState.longPressTimer);
    }
    
    // Don't process if it was a long press (already handled)
    if (touchState.isLongPress) {
      setTouchState(prev => ({ ...prev, isLongPress: false, longPressTimer: null }));
      return;
    }
    
    // Handle different touch gestures
    if (touchState.tapCount === 2) {
      // Double tap - select word
      handleDoubleTap(e);
    } else if (touchDuration < 200) {
      // Single tap - select word (fallback)
      handleSingleTap(e);
    }
    
    setTouchState(prev => ({ ...prev, longPressTimer: null }));
  };
  
  const handleSingleTap = (e) => {
    const target = document.elementFromPoint(
      touchState.startPos.x,
      touchState.startPos.y
    );
    
    if (target && textRef.current.contains(target)) {
      const word = getWordAtPosition(target, touchState.startPos);
      if (word.text) {
        handleTranslate(word.text, word.context, word.rect);
      }
    }
  };
  
  const handleDoubleTap = (e) => {
    e.preventDefault();
    const target = document.elementFromPoint(
      touchState.startPos.x,
      touchState.startPos.y
    );
    
    if (target && textRef.current.contains(target)) {
      const word = getWordAtPosition(target, touchState.startPos);
      if (word.text) {
        // Add visual feedback for double tap
        target.style.backgroundColor = 'rgba(57, 106, 252, 0.2)';
        setTimeout(() => {
          target.style.backgroundColor = '';
        }, 300);
        
        handleTranslate(word.text, word.context, word.rect);
      }
    }
  };
  
  const handleLongPress = (e) => {
    const target = document.elementFromPoint(
      touchState.startPos.x,
      touchState.startPos.y
    );
    
    if (target && textRef.current.contains(target)) {
      const sentence = getSentenceAtPosition(target, touchState.startPos);
      if (sentence.text) {
        // Add visual feedback for long press
        if (navigator.vibrate) {
          navigator.vibrate(50); // Haptic feedback
        }
        
        handleTranslate(sentence.text, sentence.context, sentence.rect);
      }
    }
  };
  
  // Get word at touch position
  const getWordAtPosition = (element, position) => {
    const fullText = textRef.current.textContent;
    const range = document.caretRangeFromPoint(position.x, position.y);
    
    if (!range) return { text: '', context: '', rect: null };
    
    // Expand range to word boundaries
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) return { text: '', context: '', rect: null };
    
    const text = textNode.textContent;
    let start = range.startOffset;
    let end = range.startOffset;
    
    // Find word boundaries
    while (start > 0 && /\w/.test(text[start - 1])) start--;
    while (end < text.length && /\w/.test(text[end])) end++;
    
    const word = text.substring(start, end).trim();
    if (!word || /^[.,!?;:"'()\[\]{}]$/.test(word)) {
      return { text: '', context: '', rect: null };
    }
    
    // Create range for the word
    const wordRange = document.createRange();
    wordRange.setStart(textNode, start);
    wordRange.setEnd(textNode, end);
    
    // Get context
    const wordStart = fullText.indexOf(word);
    const contextStart = Math.max(0, wordStart - 50);
    const contextEnd = Math.min(fullText.length, wordStart + word.length + 50);
    const context = fullText.substring(contextStart, contextEnd);
    
    return {
      text: word,
      context: context,
      rect: wordRange.getBoundingClientRect()
    };
  };
  
  // Get sentence at touch position
  const getSentenceAtPosition = (element, position) => {
    const fullText = textRef.current.textContent;
    const range = document.caretRangeFromPoint(position.x, position.y);
    
    if (!range) return { text: '', context: '', rect: null };
    
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) return { text: '', context: '', rect: null };
    
    // Find sentence boundaries
    const sentences = fullText.split(/[.!?]+/);
    let currentPos = 0;
    let targetSentence = '';
    
    for (const sentence of sentences) {
      const sentenceEnd = currentPos + sentence.length;
      const rangePos = fullText.indexOf(textNode.textContent) + range.startOffset;
      
      if (rangePos >= currentPos && rangePos <= sentenceEnd) {
        targetSentence = sentence.trim();
        break;
      }
      currentPos = sentenceEnd + 1;
    }
    
    if (!targetSentence) return { text: '', context: '', rect: null };
    
    // Create range for the sentence
    const sentenceStart = fullText.indexOf(targetSentence);
    const sentenceRange = document.createRange();
    
    // Find the text nodes that contain this sentence
    const walker = document.createTreeWalker(
      textRef.current,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let currentOffset = 0;
    let startNode = null;
    let endNode = null;
    let startOffset = 0;
    let endOffset = 0;
    
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const nodeLength = node.textContent.length;
      
      if (!startNode && currentOffset + nodeLength > sentenceStart) {
        startNode = node;
        startOffset = sentenceStart - currentOffset;
      }
      
      if (currentOffset + nodeLength >= sentenceStart + targetSentence.length) {
        endNode = node;
        endOffset = sentenceStart + targetSentence.length - currentOffset;
        break;
      }
      
      currentOffset += nodeLength;
    }
    
    if (startNode && endNode) {
      sentenceRange.setStart(startNode, startOffset);
      sentenceRange.setEnd(endNode, endOffset);
    }
    
    return {
      text: targetSentence,
      context: targetSentence, // For sentences, context is the sentence itself
      rect: sentenceRange.getBoundingClientRect()
    };
  };
  
  // Handle text selection (desktop)
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
  
  // Setup event listeners
  useEffect(() => {
    const element = textRef.current;
    if (!element) return;
    
    // Add both mouse and touch event listeners
    if (isMobileDevice()) {
      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchend', handleTouchEnd, { passive: false });
    } else {
      document.addEventListener('mouseup', handleTextSelection);
    }
    
    return () => {
      if (isMobileDevice()) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
      } else {
        document.removeEventListener('mouseup', handleTextSelection);
      }
      
      // Clean up any pending timers
      if (touchState.longPressTimer) {
        clearTimeout(touchState.longPressTimer);
      }
    };
  }, [touchState.longPressTimer]);
  
  // Mobile-optimized tooltip positioning
  const getOptimalTooltipPosition = (rect) => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    const tooltipWidth = isMobileDevice() ? Math.min(300, viewport.width - 40) : 300;
    const tooltipHeight = 80; // Estimated tooltip height
    
    let x = rect.left + (rect.width / 2);
    let y = rect.top;
    
    // Adjust horizontal position to stay within viewport
    if (x - tooltipWidth / 2 < 20) {
      x = tooltipWidth / 2 + 20;
    } else if (x + tooltipWidth / 2 > viewport.width - 20) {
      x = viewport.width - tooltipWidth / 2 - 20;
    }
    
    // Adjust vertical position for mobile
    if (isMobileDevice()) {
      // On mobile, show tooltip above the selection if there's space
      if (y - tooltipHeight - 20 > 0) {
        y = y - 20; // Above selection
      } else {
        y = rect.bottom + 20; // Below selection
      }
    } else {
      y = y - 10; // Desktop behavior
    }
    
    return { x, y };
  };
  
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
        const position = getOptimalTooltipPosition(rect);
        
        // Show tooltip
        setTooltip({
          visible: true,
          text,
          translation,
          position,
          context,
          isMobile: isMobileDevice()
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
  
  // Handle pronunciation audio
  const handlePlayAudio = async () => {
    if (!audioSupported) {
      console.warn('Audio not supported in this browser');
      return;
    }
    
    try {
      await playPronunciation(tooltip.text, tooltip.context);
    } catch (error) {
      console.error('Error playing pronunciation:', error);
    }
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
          className={`tooltip-container ${tooltip.isMobile ? 'mobile-tooltip' : ''}`}
          style={{
            position: 'fixed',
            left: tooltip.position.x,
            top: tooltip.position.y,
            transform: tooltip.isMobile ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
            zIndex: 1000,
            backgroundColor: '#333',
            color: 'white',
            padding: tooltip.isMobile ? '12px 16px' : '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            maxWidth: tooltip.isMobile ? 'calc(100vw - 40px)' : '300px',
            fontSize: tooltip.isMobile ? '0.9rem' : '0.85rem',
            lineHeight: '1.4'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ marginBottom: '8px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}>
              <strong>{tooltip.text}</strong>
              {audioSupported && (
                <button
                  onClick={handlePlayAudio}
                  disabled={isGeneratingAudio || isPlayingAudio}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: isGeneratingAudio || isPlayingAudio ? 'not-allowed' : 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: tooltip.isMobile ? '32px' : '24px',
                    minHeight: tooltip.isMobile ? '32px' : '24px',
                    fontSize: tooltip.isMobile ? '1rem' : '0.9rem',
                    opacity: isGeneratingAudio || isPlayingAudio ? 0.6 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isGeneratingAudio && !isPlayingAudio) {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                  title="Listen to pronunciation"
                >
                  {isGeneratingAudio ? (
                    <FaSpinner className="fa-spin" />
                  ) : (
                    <FaVolumeUp />
                  )}
                </button>
              )}
            </div>
            <span>{tooltip.translation}</span>
          </div>
          {addedMessage ? (
            <div style={{ 
              color: '#4CAF50', 
              marginTop: '8px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {addedMessage}
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              gap: tooltip.isMobile ? '8px' : '6px',
              marginTop: '8px'
            }}>
              <button
                onClick={handleAddToStudy}
                style={{
                  background: 'rgba(57, 106, 252, 0.8)',
                  border: 'none',
                  color: 'white',
                  padding: tooltip.isMobile ? '8px 16px' : '4px 8px',
                  fontSize: tooltip.isMobile ? '0.85rem' : '0.75rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  flex: 1,
                  fontWeight: '500',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(57, 106, 252, 1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(57, 106, 252, 0.8)'}
              >
                Add to Study List
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TranslatableText;
