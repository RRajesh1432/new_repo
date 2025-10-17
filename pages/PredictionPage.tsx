import React from 'react';
import PredictionForm from '../components/PredictionForm';
import ResultsDisplay from '../components/ResultsDisplay';
import Loader from '../components/Loader';
import type { PredictionFormData, PredictionResult } from '../types';
import MapInput from '../components/MapInput';

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
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">AI-Powered Yield Prediction</h1>
                <p className="mt-2 text-lg text-gray-600">Enter your farm's data to get an intelligent yield forecast and recommendations.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <PredictionForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} isLoading={isLoading} />
                </div>
                <div>
                     <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800">Define Field Shape</h2>
                        <p className="text-sm text-gray-500">
                            Use the tools on the map to draw, edit, or delete the polygon representing your field.
                        </p>
                        <MapInput onShapeChange={handleShapeChange} />
                    </div>
                </div>
            </div>

            {isLoading && <Loader message="Our AI is analyzing your data..." />}
            {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
            {result && <ResultsDisplay result={result} />}
        </div>
    );
};

export default PredictionPage;