import React, { useState, useContext, useEffect } from 'react';
import { StoryContext } from '../contexts/StoryContext';
import { FaDice, FaPlay, FaRandom } from 'react-icons/fa';

// List of common Spanish verbs for random selection
const commonVerbs = [
  'hablar', 'comer', 'vivir', 'ser', 'estar', 'ir', 'hacer', 'tener', 'poder',
  'querer', 'decir', 'ver', 'dar', 'saber', 'llegar', 'pasar', 'deber', 'poner',
  'parecer', 'quedar', 'creer', 'dejar', 'sentir', 'pensar', 'encontrar', 'salir',
  'volver', 'tomar', 'conocer', 'seguir', 'llevar', 'empezar', 'necesitar', 'buscar',
  'terminar', 'permitir', 'esperar', 'entrar', 'trabajar', 'escribir', 'perder',
  'existir', 'ocurrir', 'venir', 'mirar', 'conseguir', 'comenzar', 'gustar', 'jugar',
  'escuchar', 'entender', 'leer', 'recibir', 'pedir', 'comprar', 'abrir', 'ayudar',
  'cambiar', 'aprender', 'caminar', 'correr', 'dormir', 'estudiar', 'ganar', 'morir',
  'pagar', 'servir', 'usar', 'vender', 'viajar', 'contar', 'mostrar', 'preferir'
];

const ControlPanel = () => {
  const { generateStory, getRandomScenario, isLoading } = useContext(StoryContext);
  
  // Form state
  const [scenario, setScenario] = useState('');
  const [contentType, setContentType] = useState('story'); // 'story' or 'conversation'
  const [verbs, setVerbs] = useState('');
  const [indirectObjectLevel, setIndirectObjectLevel] = useState(1);
  const [reflexiveVerbLevel, setReflexiveVerbLevel] = useState(1);
  const [idiomaticExpressions, setIdiomaticExpressions] = useState(false);
  const [level, setLevel] = useState('B1');
  
  // Handle random scenario generation
  const handleRandomScenario = async () => {
    try {
      console.log('Random scenario button clicked');
      const randomScenario = await getRandomScenario();
      console.log('Setting scenario to:', randomScenario);
      setScenario(randomScenario);
    } catch (error) {
      console.error('Error in handleRandomScenario:', error);
    }
  };
  
  // Handle random verb generation
  const handleRandomVerbs = () => {
    try {
      console.log('Random verbs button clicked');
      
      // Create a copy of the verbs array to avoid duplicates
      const availableVerbs = [...commonVerbs];
      const selectedVerbs = [];
      
      // Select two random verbs
      for (let i = 0; i < 2; i++) {
        if (availableVerbs.length === 0) break;
        
        const randomIndex = Math.floor(Math.random() * availableVerbs.length);
        const selectedVerb = availableVerbs.splice(randomIndex, 1)[0];
        selectedVerbs.push(selectedVerb);
      }
      
      // Format the verbs as a comma-separated string
      const verbString = selectedVerbs.join(', ');
      console.log('Setting verbs to:', verbString);
      setVerbs(verbString);
    } catch (error) {
      console.error('Error in handleRandomVerbs:', error);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare parameters object
    const parameters = {
      scenario,
      contentType,
      verbs: verbs.split(',').map(verb => verb.trim()).filter(verb => verb),
      indirectObjectLevel: parseInt(indirectObjectLevel),
      reflexiveVerbLevel: parseInt(reflexiveVerbLevel),
      idiomaticExpressions,
      level
    };
    
    // Call generate story function from context
    generateStory(parameters);
  };
  
  // Get random scenario on initial load
  useEffect(() => {
    handleRandomScenario();
  }, []);
  
  return (
    <div className="panel right-panel">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Scenario</label>
          <div className="scenario-input">
            <textarea
              className="scenario-textarea"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Enter a scenario"
              required
            />
            <button 
              type="button" 
              className="btn random-btn" 
              onClick={handleRandomScenario}
              title="Generate random scenario"
            >
              <FaDice />
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Content Type</label>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${contentType === 'story' ? 'active' : ''}`}
              onClick={() => setContentType('story')}
            >
              Story
            </button>
            <button
              type="button"
              className={`toggle-btn ${contentType === 'conversation' ? 'active' : ''}`}
              onClick={() => setContentType('conversation')}
            >
              Conversation
            </button>
          </div>
        </div>
        
        <div className="parameters-control">
          <div className="form-group">
            <label className="form-label">Verbs (comma separated)</label>
            <div className="scenario-input">
              <input
                type="text"
                value={verbs}
                onChange={(e) => setVerbs(e.target.value)}
                placeholder="e.g. hablar, comer, vivir"
              />
              <button 
                type="button" 
                className="btn random-btn" 
                onClick={handleRandomVerbs}
                title="Generate random verbs"
              >
                <FaDice />
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Indirect Object Usage</label>
            <div className="slider-label">
              <span>Minimal</span>
              <span>Medium</span>
              <span>Abundant</span>
            </div>
            <input
              type="range"
              className="slider"
              min="1"
              max="3"
              value={indirectObjectLevel}
              onChange={(e) => setIndirectObjectLevel(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Reflexive Verb Usage</label>
            <div className="slider-label">
              <span>Minimal</span>
              <span>Medium</span>
              <span>Abundant</span>
            </div>
            <input
              type="range"
              className="slider"
              min="1"
              max="3"
              value={reflexiveVerbLevel}
              onChange={(e) => setReflexiveVerbLevel(e.target.value)}
            />
          </div>
          
          <div className="form-group checkbox-container">
            <input
              type="checkbox"
              id="idiomaticExpressions"
              checked={idiomaticExpressions}
              onChange={(e) => setIdiomaticExpressions(e.target.checked)}
            />
            <label htmlFor="idiomaticExpressions">Include Idiomatic Expressions</label>
          </div>
          
          <div className="form-group">
            <label className="form-label">Difficulty Level</label>
            <div className="level-selector">
              <button
                type="button"
                className={`level-btn ${level === 'A1' ? 'active' : ''}`}
                onClick={() => setLevel('A1')}
              >
                A1
              </button>
              <button
                type="button"
                className={`level-btn ${level === 'A2' ? 'active' : ''}`}
                onClick={() => setLevel('A2')}
              >
                A2
              </button>
              <button
                type="button"
                className={`level-btn ${level === 'B1' ? 'active' : ''}`}
                onClick={() => setLevel('B1')}
              >
                B1
              </button>
              <button
                type="button"
                className={`level-btn ${level === 'B2' ? 'active' : ''}`}
                onClick={() => setLevel('B2')}
              >
                B2
              </button>
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn generate-btn" 
          disabled={isLoading || !scenario}
        >
          <FaPlay style={{ marginRight: '10px' }} />
          {isLoading ? 'Generating...' : 'Generate Story'}
        </button>
      </form>
    </div>
  );
};

export default ControlPanel;
