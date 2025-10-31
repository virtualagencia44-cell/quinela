
import React, { useContext } from 'react';
import Header from './components/Header';
import Nav from './components/Nav';
import BettingView from './components/BettingView';
import ReportsView from './components/ReportsView';
import ResultsView from './components/ResultsView';
import { AppContext } from './context/AppContext';
import type { AppContextType } from './types';

const App: React.FC = () => {
  const { currentView } = useContext(AppContext) as AppContextType;

  const renderView = () => {
    switch (currentView) {
      case 'betting':
        return <BettingView />;
      case 'reports':
        return <ReportsView />;
      case 'results':
        return <ResultsView />;
      default:
        return <BettingView />;
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans">
      <Header />
      <Nav />
      <main className="flex-grow p-4 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
