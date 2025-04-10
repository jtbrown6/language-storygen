import React, { useContext, useState } from 'react';
import { StudyListContext } from '../contexts/StudyListContext';
import { FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const StudyListPanel = () => {
  const { studyList, removeStudyItem, isLoading } = useContext(StudyListContext);
  const [expanded, setExpanded] = useState(false);
  
  // Determine which items to show (all or just the 5 most recent)
  const itemsToShow = expanded ? studyList : studyList.slice(0, 5);
  const hasMoreItems = studyList.length > 5;
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div className="study-list-panel">
      <div className="study-list-header">
        <h2>Study List</h2>
        {hasMoreItems && (
          <button 
            className="toggle-expand-btn" 
            onClick={toggleExpanded}
            aria-label={expanded ? 'Collapse study list' : 'Expand study list'}
          >
            {expanded ? <FaChevronUp /> : <FaChevronDown />}
            {expanded ? 'Show Less' : `Show All (${studyList.length})`}
          </button>
        )}
      </div>
      
      {studyList.length === 0 ? (
        <p>Your study list is empty. Click on words or phrases in stories to add them for studying.</p>
      ) : (
        <>
          <div className="study-items-grid">
            {itemsToShow.map((item) => (
              <div key={item._id || item.id} className="study-card">
                <div className="study-card-content">
                  <div className="study-card-original">{item.text}</div>
                  <div className="study-card-translation">{item.translation}</div>
                  {item.context && (
                    <div className="study-card-context">
                      <small>Context: "{item.context}"</small>
                    </div>
                  )}
                </div>
                <button 
                  className="remove-study-btn" 
                  onClick={() => removeStudyItem(item._id || item.id)}
                  disabled={isLoading}
                  aria-label="Remove from study list"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          
          {!expanded && hasMoreItems && (
            <div className="study-list-footer">
              <button 
                className="show-more-btn" 
                onClick={toggleExpanded}
              >
                Show {studyList.length - 5} more items...
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudyListPanel;
