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
    <div className="w-full h-screen relative bg-black">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Scene treeState={treeState} />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        {/* Header */}
        <header className="flex flex-col items-start space-y-2 animate-fade-in-down">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 rounded-full border border-[#FFD700] bg-[#002211] flex items-center justify-center">
                <span className="text-[#FFD700] text-sm font-bold font-serif">A</span>
             </div>
             <h3 className="text-[#FFD700] tracking-[0.2em] text-xs font-bold uppercase opacity-80">
               Arix Signature
             </h3>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-white leading-tight">
            Interactive <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#008f51]">
              Christmas
            </span>
          </h1>
        </header>

        {/* Footer Controls */}
        <footer className="flex flex-col md:flex-row items-center justify-between w-full pointer-events-auto">
           <div className="text-white/40 text-sm font-light max-w-xs mb-6 md:mb-0">
             Experience the magic of deconstruction. Toggle the form to reveal the essence of the season.
           </div>

           <button 
             onClick={toggleState}
             className={`
               group relative px-8 py-4 bg-transparent overflow-hidden rounded-none border border-[#FFD700]/30 
               transition-all duration-500 hover:border-[#FFD700] hover:bg-[#FFD700]/10
             `}
           >
             <div className="absolute inset-0 w-0 bg-[#FFD700] transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></div>
             <span className="relative flex items-center space-x-3">
               <span className="uppercase tracking-[0.15em] text-[#FFD700] font-bold text-sm">
                 {treeState === TreeState.SCATTERED ? 'Assemble Tree' : 'Scatter Elements'}
               </span>
               <svg 
                 className={`w-4 h-4 text-[#FFD700] transform transition-transform duration-500 ${treeState === TreeState.TREE_SHAPE ? 'rotate-180' : ''}`} 
                 fill="none" viewBox="0 0 24 24" stroke="currentColor"
               >
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
               </svg>
             </span>
           </button>
        </footer>
      </div>

      {/* Decorative Borders */}
      <div className="absolute top-0 left-0 w-full h-full border-[1px] border-[#FFD700]/5 pointer-events-none m-4 box-border" style={{ width: 'calc(100% - 2rem)', height: 'calc(100% - 2rem)'}}></div>
    </div>
  );
};

export default App;