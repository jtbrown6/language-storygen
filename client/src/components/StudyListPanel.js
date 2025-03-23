import React, { useContext } from 'react';
import { StudyListContext } from '../contexts/StudyListContext';
import { FaTrash } from 'react-icons/fa';

const StudyListPanel = () => {
  const { studyList, removeStudyItem, isLoading } = useContext(StudyListContext);
  
  return (
    <div className="study-list-panel">
      <h2>Study List</h2>
      
      {studyList.length === 0 ? (
        <p>Your study list is empty. Click on words or phrases in stories to add them for studying.</p>
      ) : (
        <div className="study-items-grid">
          {studyList.map((item) => (
            <div key={item.id} className="study-card">
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
                onClick={() => removeStudyItem(item.id)}
                disabled={isLoading}
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyListPanel;
