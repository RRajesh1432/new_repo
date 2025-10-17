import React, { useState, useEffect } from 'react';
import { getCropInfo } from '../services/geminiService';
import type { CropInfo } from '../types';
import Loader from '../components/Loader';
import { CROP_TYPES } from '../constants';

const InfoCard: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">{title}</h3>
        {children}
    </div>
);

const CropExplorerPage: React.FC = () => {
    const [cropName, setCropName] = useState<string>(CROP_TYPES[0]);
    const [cropInfo, setCropInfo] = useState<CropInfo | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCropData = async (name: string) => {
        if (!name) return;
        setIsLoading(true);
        setError(null);
        setCropInfo(null);

        try {
            const info = await getCropInfo(name);
            setCropInfo(info);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCropData(CROP_TYPES[0]);
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        fetchCropData(cropName);
    };
    
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                 <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Crop Explorer</h1>
                 <p className="mt-2 text-lg text-gray-600">Get detailed information about any crop from our AI database.</p>
            </div>
            
            <form onSubmit={handleSearch} className="flex gap-2 p-4 bg-white rounded-xl shadow-md border">
                <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                    {CROP_TYPES.map(crop => (
                        <option key={crop} value={crop}>{crop}</option>
                    ))}
                </select>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </form>
            
            {isLoading && <Loader message={`Fetching info for ${cropName}...`} />}
            {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

            {cropInfo && (
                <div className="space-y-6 animate-fade-in">
                    <InfoCard title={`About ${cropInfo.cropName}`}>
                        <p className="text-gray-600">{cropInfo.description}</p>
                    </InfoCard>

                    <div className="grid md:grid-cols-2 gap-6">
                        <InfoCard title="Ideal Growing Conditions">
                            <ul className="space-y-2 text-gray-700">
                                <li><strong>Soil Types:</strong> {cropInfo.idealConditions.soilType.join(', ')}</li>
                                <li><strong>Temperature:</strong> {cropInfo.idealConditions.temperatureRange}</li>
                                <li><strong>Rainfall:</strong> {cropInfo.idealConditions.annualRainfall}</li>
                            </ul>
                        </InfoCard>

                        <InfoCard title="Cultivation Details">
                            <ul className="space-y-2 text-gray-700">
                                <li><strong>Growing Cycle:</strong> {cropInfo.growingCycle}</li>
                                <li><strong>Common Pests:</strong> {cropInfo.commonPests.join(', ')}</li>
                            </ul>
                        </InfoCard>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CropExplorerPage;