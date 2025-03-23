import React, { useContext } from 'react';
import { StudyListContext } from '../contexts/StudyListContext';
import { FaTrash } from 'react-icons/fa';

const StudyList = () => {
  const { studyList, removeStudyItem, isLoading } = useContext(StudyListContext);
  
  return (
    <div className="study-list">
      <h3>Study List</h3>
      
      {studyList.length === 0 ? (
        <p>Your study list is empty. Click on words in the story to add them.</p>
      ) : (
        <div className="study-items">
          {studyList.map((item) => (
            <div key={item.id} className="study-item">
              <div className="study-item-text">
                <div className="study-item-original">{item.text}</div>
                <div className="study-item-translation">{item.translation}</div>
              </div>
              <button 
                className="remove-btn" 
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

export default StudyList;
