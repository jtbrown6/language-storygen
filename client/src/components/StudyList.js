import React, { useContext, useState } from 'react';
import { StudyListContext } from '../contexts/StudyListContext';
import { FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const StudyList = () => {
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
    <div className="study-list">
      <div className="study-list-header">
        <h3>Study List</h3>
        {hasMoreItems && (
          <button 
            className="toggle-expand-btn" 
            onClick={toggleExpanded}
            aria-label={expanded ? 'Collapse study list' : 'Expand study list'}
          >
            {expanded ? <FaChevronUp /> : <FaChevronDown />}
            <span>{expanded ? 'Show Less' : `Show All (${studyList.length})`}</span>
          </button>
        )}
      </div>
      
      {studyList.length === 0 ? (
        <p>Your study list is empty. Click on words in the story to add them.</p>
      ) : (
        <>
          <div className="study-items">
            {itemsToShow.map((item) => (
              <div key={item._id || item.id} className="study-item">
                <div className="study-item-text">
                  <div className="study-item-original">{item.text}</div>
                  <div className="study-item-translation">{item.translation}</div>
                </div>
                <button 
                  className="remove-btn" 
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

export default StudyList;
