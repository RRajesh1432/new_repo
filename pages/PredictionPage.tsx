
import React, { useContext } from 'react';
import PredictionForm from '../components/PredictionForm';
import ResultsDisplay from '../components/ResultsDisplay';
import Loader from '../components/Loader';
import type { PredictionFormData, PredictionResult } from '../types';
import MapInput from '../components/MapInput';
import { LanguageContext } from '../contexts/LanguageContext';

interface PredictionPageProps {
    formData: PredictionFormData;
    setFormData: React.Dispatch<React.SetStateAction<PredictionFormData>>;
    result: PredictionResult | null;
    isLoading: boolean;
    error: string | null;
    handleShapeChange: (shapeGeoJSON: string, areaHectares: number) => void;
    handleSubmit: (e: React.FormEvent) => void;
}

const PredictionPage: React.FC<PredictionPageProps> = ({
    formData,
    setFormData,
    result,
    isLoading,
    error,
    handleShapeChange,
    handleSubmit,
}) => {
    const { t } = useContext(LanguageContext)!;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{t('predictionPage.title')}</h1>
                <p className="mt-2 text-lg text-gray-600">{t('predictionPage.subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <PredictionForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} isLoading={isLoading} />
                </div>
                <div>
                     <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800">{t('predictionPage.defineField')}</h2>
                        <p className="text-sm text-gray-500">
                            {t('predictionPage.defineFieldDesc')}
                        </p>
                        <MapInput onShapeChange={handleShapeChange} />
                    </div>
                </div>
            </div>

            {isLoading && <Loader message={t('predictionPage.loading')} />}
            {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">{`${t('predictionPage.errorPrefix')}: ${error}`}</div>}
            {result && <ResultsDisplay result={result} />}
        </div>
    );
};

export default PredictionPage;
