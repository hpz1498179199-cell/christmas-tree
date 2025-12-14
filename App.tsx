import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.SCATTERED);

  const toggleState = () => {
    setTreeState(prev => 
      prev === TreeState.SCATTERED ? TreeState.TREE_SHAPE : TreeState.SCATTERED
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#000502' }}>
      {/* 3D Canvas Layer */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Scene treeState={treeState} />
      </div>

      {/* UI Overlay */}
      <div className="ui-layer">
        {/* Header */}
        <header className="header">
          <div className="brand">
             <div className="logo-circle">
                <span className="logo-text">A</span>
             </div>
             <h3 className="logo-text" style={{ fontSize: '0.75rem' }}>
               Arix Signature
             </h3>
          </div>
          <h1 className="main-title">
            Interactive <br/> 
            <span className="gradient-text">
              Christmas
            </span>
          </h1>
        </header>

        {/* Footer Controls */}
        <footer className="footer">
           <div className="footer-desc">
             Experience the magic of deconstruction. Toggle the form to reveal the essence of the season.
           </div>

           <button 
             onClick={toggleState}
             className="action-btn"
           >
             <span className="btn-text">
               {treeState === TreeState.SCATTERED ? 'Assemble Tree' : 'Scatter Elements'}
             </span>
             <svg 
               className={`btn-icon ${treeState === TreeState.TREE_SHAPE ? 'rotated' : ''}`} 
               fill="none" viewBox="0 0 24 24" stroke="currentColor"
             >
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
             </svg>
           </button>
        </footer>
      </div>

      {/* Decorative Borders */}
      <div className="frame-border"></div>
    </div>
  );
};

export default App;