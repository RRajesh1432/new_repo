import React, { useState, useEffect, useContext } from 'react';
import { getHistory, clearHistory } from '../services/historyService';
import type { HistoryEntry, Recommendation, RiskFactor, WeatherImpact } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';

const DetailCard: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <div className="mt-4">
        <h4 className="font-semibold text-gray-800 mb-2">{title}:</h4>
        <div className="pl-2 border-l-2 border-gray-200">{children}</div>
    </div>
);

const RecommendationItem: React.FC<{ item: Recommendation }> = ({ item }) => {
    const impactColor = {
        'High': 'bg-red-100 text-red-800',
        'Medium': 'bg-yellow-100 text-yellow-800',
        'Low': 'bg-green-100 text-green-800',
    }[item.impact];

    return (
        <div className="p-3 bg-white rounded-md border border-gray-200 mb-2">
            <div className="flex justify-between items-start text-sm">
                <h5 className="font-semibold text-gray-900">{item.title}</h5>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${impactColor}`}>{item.impact} Impact</span>
            </div>
            <p className="text-gray-600 mt-1 text-xs">{item.description}</p>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2">
                {item.potentialYieldIncrease && (
                    <p className="text-xs font-medium text-green-600">+ {item.potentialYieldIncrease}% Potential Yield</p>
                )}
                {item.fertilizerType && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-gray-600">Fertilizer:</span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[11px] font-semibold rounded-full">{item.fertilizerType}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const RiskItem: React.FC<{ item: RiskFactor, isHighlighted?: boolean }> = ({ item, isHighlighted = false }) => {
    const severityColor = {
        'High': 'bg-red-100 text-red-800',
        'Medium': 'bg-yellow-100 text-yellow-800',
        'Low': 'bg-blue-100 text-blue-800',
    }[item.severity];
    
    const highlightClass = isHighlighted ? 'ring-2 ring-yellow-500 bg-yellow-50' : '';

    return (
        <li className={`flex items-center justify-between text-sm py-1 px-2 rounded-md ${highlightClass}`}>
            <span className="text-gray-700">{item.risk}</span>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${severityColor}`}>{item.severity}</span>
        </li>
    );
};

const CompactWeatherImpact: React.FC<{ analysis: WeatherImpact }> = ({ analysis }) => {
    const { t } = useContext(LanguageContext)!;
    const { overallImpact, temperatureEffect, rainfallEffect, keyWeatherRisks } = analysis;

    const impactDetails = {
        Positive: { textColor: 'text-green-700', label: t('resultsDisplay.positive') },
        Neutral: { textColor: 'text-yellow-700', label: t('resultsDisplay.neutral') },
        Negative: { textColor: 'text-red-700', label: t('resultsDisplay.negative') }
    };

    const details = impactDetails[overallImpact] || impactDetails.Neutral;

    return (
        <div className="text-xs space-y-3 bg-white p-3 rounded-lg border border-gray-200">
            <p><strong className="font-medium text-gray-800">{t('resultsDisplay.overallImpact')}:</strong> <span className={`font-semibold ${details.textColor}`}>{details.label}</span></p>
            <p><strong className="font-medium text-gray-800">{t('resultsDisplay.temperatureEffect')}:</strong> <span className="text-gray-700">{temperatureEffect}</span></p>
            <p><strong className="font-medium text-gray-800">{t('resultsDisplay.rainfallEffect')}:</strong> <span className="text-gray-700">{rainfallEffect}</span></p>
             {keyWeatherRisks && keyWeatherRisks.length > 0 && (
                <div>
                    <strong className="font-medium text-gray-800 block mb-1">{t('resultsDisplay.keyWeatherRisks')}:</strong>
                     <ul className="list-disc list-inside space-y-1 pl-2">
                        {keyWeatherRisks.map((risk, index) => <li key={index} className="text-gray-700">{risk}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
};


const HistoryItem: React.FC<{ entry: HistoryEntry }> = ({ entry }) => {
    const { t } = useContext(LanguageContext)!;
    const [isOpen, setIsOpen] = useState(false);

    const pestRiskIdentifier = "High risk of pest infestation";
    const risksWithPesticides = entry.result.riskFactors.filter(r => r.risk !== pestRiskIdentifier);
    const risksWithoutPesticides = entry.result.riskFactors;


    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
            <button
                className="w-full text-left p-4 focus:outline-none transition-colors hover:bg-gray-50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-lg font-semibold text-green-700">{t(`cropTypes.${entry.formData.cropType}`)} - {entry.formData.area} ha</p>
                        <p className="text-sm text-gray-500">{entry.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-4">
                         <p className="text-lg font-bold text-gray-800">
                           <span title={t('resultsDisplay.withPesticides')}>{entry.result.predictedYieldWithPesticides.toFixed(2)}</span> / <span className="text-yellow-700" title={t('resultsDisplay.withoutPesticides')}>{entry.result.predictedYieldWithoutPesticides.toFixed(2)}</span>
                            <span className="text-sm font-medium text-gray-600 ml-1">{entry.result.yieldUnit}</span>
                         </p>
                         <span className={`transform transition-transform duration-200 text-green-700 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                </div>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200 bg-gray-50/70 animate-fade-in text-sm">
                    <DetailCard title={t('historyPage.inputs')}>
                        <div className="space-y-4 text-xs">
                            <div>
                                <h5 className="font-semibold text-gray-500 uppercase tracking-wider text-[11px] mb-1">{t('historyPage.fieldCropDetails')}</h5>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-gray-700">
                                    <p><strong className="font-medium text-gray-800">{t('predictionForm.cropType')}:</strong> {t(`cropTypes.${entry.formData.cropType}`)}</p>
                                    <p><strong className="font-medium text-gray-800">{t('predictionForm.area')}:</strong> {entry.formData.area}</p>
                                    <p><strong className="font-medium text-gray-800">{t('predictionForm.soilType')}:</strong> {t(`soilTypes.${entry.formData.soilType}`)}</p>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                                <h5 className="font-semibold text-gray-500 uppercase tracking-wider text-[11px] mb-1">{t('historyPage.climateConditions')}</h5>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-gray-700">
                                    <p><strong className="font-medium text-gray-800">{t('predictionForm.rainfall')}:</strong> {entry.formData.rainfall}</p>
                                    <p><strong className="font-medium text-gray-800">{t('predictionForm.temperature')}:</strong> {entry.formData.temperature}</p>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                                <h5 className="font-semibold text-gray-500 uppercase tracking-wider text-[11px] mb-1">{t('historyPage.farmManagement')}</h5>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-gray-700">
                                    <p><strong className="font-medium text-gray-800">{t('predictionForm.fertilizerType')}:</strong> {t(`fertilizerTypes.${entry.formData.fertilizerType}`)}</p>
                                    <p><strong className="font-medium text-gray-800">{t('predictionForm.waterSource')}:</strong> {t(`waterSources.${entry.formData.waterSource}`)}</p>
                                </div>
                            </div>
                        </div>
                    </DetailCard>
                    <DetailCard title={t('historyPage.summary')}>
                         <p className="text-gray-700 text-xs">{entry.result.summary}</p>
                    </DetailCard>
                    
                    {/* Scenario Comparison */}
                    <div className="mt-4">
                        <h4 className="font-semibold text-gray-800 mb-2">{t('historyPage.scenarioComparison')}:</h4>
                        <div className="pl-2 border-l-2 border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                           {/* With Pesticides */}
                            <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                <h5 className="font-bold text-green-700">{t('resultsDisplay.withPesticides')}</h5>
                                <p className="text-gray-800 font-semibold">{entry.result.predictedYieldWithPesticides.toFixed(2)} <span className="text-xs font-normal text-gray-600">{entry.result.yieldUnit}</span></p>
                                <h6 className="font-semibold text-xs text-gray-600 pt-1">{t('resultsDisplay.riskFactors')}:</h6>
                                <ul className="space-y-1">
                                    {risksWithPesticides.length > 0 ? risksWithPesticides.map((risk, index) => (
                                       <RiskItem key={index} item={risk} />
                                    )) : <li className="text-xs text-gray-500">No other major risks identified.</li>}
                                </ul>
                            </div>
                            {/* Without Pesticides */}
                            <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                <h5 className="font-bold text-yellow-700">{t('resultsDisplay.withoutPesticides')}</h5>
                                <p className="text-gray-800 font-semibold">{entry.result.predictedYieldWithoutPesticides.toFixed(2)} <span className="text-xs font-normal text-gray-600">{entry.result.yieldUnit}</span></p>
                                <h6 className="font-semibold text-xs text-gray-600 pt-1">{t('resultsDisplay.riskFactors')}:</h6>
                                <ul className="space-y-1">
                                    {risksWithoutPesticides.map((risk, index) => (
                                       <RiskItem key={index} item={risk} isHighlighted={risk.risk === pestRiskIdentifier} />
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <DetailCard title={t('historyPage.weatherImpact')}>
                        <CompactWeatherImpact analysis={entry.result.weatherImpactAnalysis} />
                    </DetailCard>

                    <DetailCard title={t('historyPage.recommendations')}>
                        <div className="space-y-2">
                             {entry.result.recommendations.map((rec, index) => (
                                <RecommendationItem key={index} item={rec} />
                            ))}
                        </div>
                    </DetailCard>
                </div>
            )}
        </div>
    );
};

const HistoryPage: React.FC = () => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const { t } = useContext(LanguageContext)!;

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    const handleClearHistory = () => {
        clearHistory();
        setHistory([]);
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{t('historyPage.title')}</h1>
                 {history.length > 0 && (
                    <button 
                        onClick={handleClearHistory}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                        {t('historyPage.clear')}
                    </button>
                )}
            </div>
            {history.length > 0 ? (
                <div className="space-y-4">
                    {history.map(entry => (
                        <HistoryItem key={entry.id} entry={entry} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 px-6 bg-white rounded-lg shadow-md border">
                    <h2 className="text-xl font-semibold text-gray-700">{t('historyPage.noHistory')}</h2>
                    <p className="mt-2 text-gray-500">{t('historyPage.noHistoryDesc')}</p>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;