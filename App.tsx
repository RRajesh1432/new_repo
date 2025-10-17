import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import PredictionPage from './pages/PredictionPage';
import HistoryPage from './pages/HistoryPage';
import CropExplorerPage from './pages/CropExplorerPage';
import AboutPage from './pages/AboutPage';
import type { Page, PredictionFormData, PredictionResult } from './types';
import { CropType, SoilType, FertilizerType, WaterSource } from './types';
import { predictYield } from './services/geminiService';
import { savePredictionToHistory } from './services/historyService';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('predict');
  
  // State lifted from PredictionPage
  const [formData, setFormData] = useState<PredictionFormData>({
    cropType: CropType.Wheat,
    fieldShape: '',
    soilType: SoilType.Loamy,
    rainfall: 450,
    temperature: 22,
    fertilizerType: FertilizerType['Nitrogen-based'],
    area: 0,
    waterSource: WaterSource.Rainfed,
  });
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Logic lifted from PredictionPage
  const handleShapeChange = (shapeGeoJSON: string, areaHectares: number) => {
    setFormData(prev => ({
        ...prev,
        fieldShape: shapeGeoJSON,
        area: parseFloat(areaHectares.toFixed(2))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
          const predictionResult = await predictYield(formData);
          setResult(predictionResult);
          const historyEntry = {
              id: new Date().toISOString(),
              timestamp: new Date().toLocaleString(),
              formData,
              result: predictionResult,
          };
          savePredictionToHistory(historyEntry);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
          setIsLoading(false);
      }
  };


  const renderPage = useCallback(() => {
    switch (currentPage) {
      case 'predict':
        return <PredictionPage 
                  formData={formData}
                  setFormData={setFormData}
                  result={result}
                  isLoading={isLoading}
                  error={error}
                  handleShapeChange={handleShapeChange}
                  handleSubmit={handleSubmit}
               />;
      case 'history':
        return <HistoryPage />;
      case 'explorer':
        return <CropExplorerPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <PredictionPage 
                  formData={formData}
                  setFormData={setFormData}
                  result={result}
                  isLoading={isLoading}
                  error={error}
                  handleShapeChange={handleShapeChange}
                  handleSubmit={handleSubmit}
                />;
    }
  }, [currentPage, formData, result, isLoading, error]);

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