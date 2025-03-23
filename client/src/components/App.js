import React, { useState } from 'react';
import Header from './Header';
import StoryPanel from './StoryPanel';
import ControlPanel from './ControlPanel';
import SavedStoriesPanel from './SavedStoriesPanel';
import StudyListPanel from './StudyListPanel';
import VerbListPanel from './VerbListPanel';
import { StoryProvider } from '../contexts/StoryContext';
import { StudyListProvider } from '../contexts/StudyListContext';

function App() {
  const [activeTab, setActiveTab] = useState('generator');
  
  const renderContent = () => {
    switch (activeTab) {
      case 'saved':
        return <SavedStoriesPanel />;
      case 'study':
        return <StudyListPanel />;
      case 'verbs':
        return <VerbListPanel />;
      case 'generator':
      default:
        return (
          <div className="content-panel">
            <StoryPanel />
            <ControlPanel />
          </div>
        );
    }
  };
  
  return (
    <div className="app">
      <StoryProvider>
        <StudyListProvider>
          <Header onTabChange={setActiveTab} />
          <main className="main-content">
            <div className="container">
              {renderContent()}
            </div>
          </main>
        </StudyListProvider>
      </StoryProvider>
    </div>
  );
}

export default App;
