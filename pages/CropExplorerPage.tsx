
import React, { useState, useEffect, useContext } from 'react';
import { getCropInfo } from '../services/geminiService';
import type { CropInfo } from '../types';
import Loader from '../components/Loader';
import { CROP_TYPES } from '../constants';
import { LanguageContext } from '../contexts/LanguageContext';

const InfoCard: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">{title}</h3>
        {children}
    </div>
);

// Helper to parse numeric ranges from strings like "18°C to 25°C"
const parseNumericRange = (rangeString: string): { min: number, max: number } | null => {
    const numbers = rangeString.match(/\d+(\.\d+)?/g);
    if (numbers && numbers.length >= 2) {
        return { min: parseFloat(numbers[0]), max: parseFloat(numbers[1]) };
    }
    if (numbers && numbers.length === 1) {
        return { min: parseFloat(numbers[0]), max: parseFloat(numbers[0]) };
    }
    return null;
};

// New visual component for displaying ideal condition ranges
const ConditionGauge: React.FC<{ label: string; range: string; unit: string; color: string }> = ({ label, range, unit, color }) => {
    const parsedRange = parseNumericRange(range);

    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="font-semibold text-gray-700">{label}</span>
                <span className="text-sm font-medium text-gray-500">{range}</span>
            </div>
            {parsedRange ? (
                 <div className="h-6 w-full bg-gray-200 rounded-full flex items-center px-1">
                    <div className="bg-gray-200 text-center text-xs font-bold text-white rounded-full" style={{ width: '100%', height: '12px', background: `linear-gradient(to right, #e5e7eb, ${color} 20%, ${color} 80%, #e5e7eb)` }}>
                    </div>
                </div>
            ) : <p className="text-sm text-gray-600">Data not available for visualization.</p>}
        </div>
    );
};


const CropExplorerPage: React.FC = () => {
    const [cropName, setCropName] = useState<string>(CROP_TYPES[0]);
    const [cropInfo, setCropInfo] = useState<CropInfo | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { locale, t } = useContext(LanguageContext)!;

    const fetchCropData = async (name: string) => {
        if (!name) return;
        setIsLoading(true);
        setError(null);
        setCropInfo(null);

        try {
            const info = await getCropInfo(name, locale);
            setCropInfo(info);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCropData(CROP_TYPES[0]);
    }, [locale]); // Refetch data if language changes

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        fetchCropData(cropName);
    };
    
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                 <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{t('cropExplorer.title')}</h1>
                 <p className="mt-2 text-lg text-gray-600">{t('cropExplorer.subtitle')}</p>
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
                    {isLoading ? t('cropExplorer.searching') : t('cropExplorer.search')}
                </button>
            </form>
            
            {isLoading && <Loader message={t('cropExplorer.loading', { cropName })} />}
            {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

            {cropInfo && (
                <div className="space-y-6 animate-fade-in">
                    <InfoCard title={t('cropExplorer.about', { cropName: cropInfo.cropName })}>
                        <p className="text-gray-600">{cropInfo.description}</p>
                    </InfoCard>

                    <div className="grid md:grid-cols-2 gap-6">
                        <InfoCard title={t('cropExplorer.idealConditions')}>
                             <div className="space-y-6">
                                <ConditionGauge label={t('cropExplorer.tempRange')} range={cropInfo.idealConditions.temperatureRange} unit="°C" color="#f97316" />
                                <ConditionGauge label={t('cropExplorer.rainfall')} range={cropInfo.idealConditions.annualRainfall} unit="mm" color="#3b82f6" />
                                <div>
                                     <span className="font-semibold text-gray-700">{t('cropExplorer.soilTypes')}</span>
                                     <div className="flex flex-wrap gap-2 mt-2">
                                        {cropInfo.idealConditions.soilType.map(soil => (
                                            <span key={soil} className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">{soil}</span>
                                        ))}
                                     </div>
                                </div>
                            </div>
                        </InfoCard>

                        <InfoCard title={t('cropExplorer.cultivationDetails')}>
                            <ul className="space-y-4 text-gray-700">
                                <li>
                                    <strong className="block text-gray-800">{t('cropExplorer.growingCycle')}</strong> 
                                    <span>{cropInfo.growingCycle}</span>
                                </li>
                                <li>
                                    <strong className="block text-gray-800">{t('cropExplorer.commonPests')}</strong> 
                                    <span>{cropInfo.commonPests.join(', ')}</span>
                                </li>
                            </ul>
                        </InfoCard>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CropExplorerPage;
