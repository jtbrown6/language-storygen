import React, { useState } from 'react';
import { FaBook, FaSave, FaList, FaLanguage } from 'react-icons/fa';

const Header = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState('generator');
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };
  
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">Story Generator</div>
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'generator' ? 'active' : ''}`}
              onClick={() => handleTabChange('generator')}
            >
              <FaBook className="tab-icon" />
              Generator
            </button>
            <button 
              className={`tab-btn ${activeTab === 'verbs' ? 'active' : ''}`}
              onClick={() => handleTabChange('verbs')}
            >
              <FaLanguage className="tab-icon" />
              Verbs
            </button>
            <button 
              className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => handleTabChange('saved')}
            >
              <FaSave className="tab-icon" />
              Saved Stories
            </button>
            <button 
              className={`tab-btn ${activeTab === 'study' ? 'active' : ''}`}
              onClick={() => handleTabChange('study')}
            >
              <FaList className="tab-icon" />
              Study List
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
