
import React, { useState, useEffect } from 'react';
import { getHistory, clearHistory } from '../services/historyService';
import type { HistoryEntry, Recommendation, RiskFactor } from '../types';

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
            {item.potentialYieldIncrease && (
                <p className="text-xs font-medium text-green-600 mt-1">+ {item.potentialYieldIncrease}% Potential Yield</p>
            )}
        </div>
    );
};

const RiskItem: React.FC<{ item: RiskFactor }> = ({ item }) => {
    const severityColor = {
        'High': 'bg-red-100 text-red-800',
        'Medium': 'bg-yellow-100 text-yellow-800',
        'Low': 'bg-blue-100 text-blue-800',
    }[item.severity];

    return (
        <li className="flex items-center justify-between text-sm py-1">
            <span className="text-gray-700">{item.risk}</span>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${severityColor}`}>{item.severity}</span>
        </li>
    );
};


const HistoryItem: React.FC<{ entry: HistoryEntry }> = ({ entry }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const prettyPrintKey = (key: string) => {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    };

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
            <button
                className="w-full text-left p-4 focus:outline-none transition-colors hover:bg-gray-50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-lg font-semibold text-green-700">{entry.formData.cropType} - {entry.formData.area} ha</p>
                        <p className="text-sm text-gray-500">{entry.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-4">
                         <p className="text-xl font-bold text-gray-800">{entry.result.predictedYield.toFixed(2)} {entry.result.yieldUnit}</p>
                         <span className={`transform transition-transform duration-200 text-green-700 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                </div>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200 bg-gray-50/70 animate-fade-in text-sm">
                    <DetailCard title="Inputs">
                        <ul className="text-gray-700 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs">
                            {Object.entries(entry.formData)
                                .filter(([key]) => key !== 'fieldShape')
                                .map(([key, value]) => (
                                <li key={key}>
                                    <strong className="font-medium">{prettyPrintKey(key)}:</strong>{' '}
                                    {key === 'pesticideUsage' ? (value ? 'Yes' : 'No') : String(value)}
                                </li>
                            ))}
                        </ul>
                    </DetailCard>
                    <DetailCard title="Summary">
                         <p className="text-gray-700 text-xs">{entry.result.summary}</p>
                    </DetailCard>
                    <DetailCard title="Key Risk Factors">
                        <ul className="space-y-1">
                            {entry.result.riskFactors.map((risk, index) => (
                               <RiskItem key={index} item={risk} />
                            ))}
                        </ul>
                    </DetailCard>
                    <DetailCard title="Actionable Recommendations">
                        <div className="space-y-2">
                             {entry.result.recommendations.map((rec, index) => (
                                <RecommendationItem key={index} item={rec} />
                            ))}
                        </div>
                    </DetailCard>
                    <DetailCard title="Weather Impact Analysis">
                        <p className="text-gray-700 text-xs">{entry.result.weatherImpactAnalysis}</p>
                    </DetailCard>
                </div>
            )}
        </div>
    );
};

const HistoryPage: React.FC = () => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);

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
                <h1 className="text-3xl font-bold text-gray-900">Prediction History</h1>
                 {history.length > 0 && (
                    <button 
                        onClick={handleClearHistory}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                        Clear History
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
                    <h2 className="text-xl font-semibold text-gray-700">No History Found</h2>
                    <p className="mt-2 text-gray-500">Your past predictions will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;