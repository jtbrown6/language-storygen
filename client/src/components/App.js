import React, { useState } from 'react';
import Header from './Header';
import ControlPanel from './ControlPanel';
import StoryPanel from './StoryPanel';
import SavedStoriesPanel from './SavedStoriesPanel';
import StudyListPanel from './StudyListPanel';
import VerbListPanel from './VerbListPanel';
import LoginModal from './LoginModal';
import { StoryProvider } from '../contexts/StoryContext';
import { StudyListProvider } from '../contexts/StudyListContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Protected App Component
const ProtectedApp = () => {
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
};

// Main App Component with Authentication
const AppContent = () => {
  const { authenticated, loading, showLogin } = useAuth();

  if (loading) {
    return (
      <div className="app" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa, #e8edf5)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '2rem', 
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #ff6b6b, #fc5c7d)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Language Story Generator
          </div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showLogin && <LoginModal />}
      {authenticated && <ProtectedApp />}
    </>
  );
};

// Root App Component
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
