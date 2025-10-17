import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import PredictionPage from './pages/PredictionPage';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CropExplorerPage from './pages/CropExplorerPage';
import AboutPage from './pages/AboutPage';
import type { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('predict');

  const renderPage = useCallback(() => {
    switch (currentPage) {
      case 'predict':
        return <PredictionPage />;
      case 'history':
        return <HistoryPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'explorer':
        return <CropExplorerPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <PredictionPage />;
    }
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="p-4 sm:p-6 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;