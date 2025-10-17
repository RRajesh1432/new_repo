
import React, { useState } from 'react';
import PredictionForm from '../components/PredictionForm';
import ResultsDisplay from '../components/ResultsDisplay';
import Loader from '../components/Loader';
import { predictYield } from '../services/geminiService';
import { savePredictionToHistory } from '../services/historyService';
import { CropType, SoilType, FertilizerType } from '../types';
import type { PredictionFormData, PredictionResult } from '../types';
import MapInput from '../components/MapInput';


const PredictionPage: React.FC = () => {
    const [formData, setFormData] = useState<PredictionFormData>({
        cropType: CropType.Wheat,
        fieldShape: '',
        soilType: SoilType.Loamy,
        rainfall: 450,
        temperature: 22,
        pesticideUsage: false,
        fertilizerType: FertilizerType['Nitrogen-based'],
        area: 0,
    });
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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
            // Save to history
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