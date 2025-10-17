
import React, { useState, useEffect } from 'react';
import { getHistory, clearHistory } from '../services/historyService';
import type { HistoryEntry } from '../types';

const HistoryItem: React.FC<{ entry: HistoryEntry }> = ({ entry }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
            <button
                className="w-full text-left p-4 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-lg font-semibold text-green-700">{entry.formData.cropType} - {entry.formData.area} ha</p>
                        <p className="text-sm text-gray-500">{entry.timestamp}</p>
                    </div>
                    <div className="text-right">
                         <p className="text-xl font-bold text-gray-800">{entry.result.predictedYield.toFixed(2)} {entry.result.yieldUnit}</p>
                         <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                </div>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200 bg-gray-50 animate-fade-in">
                    <h4 className="font-semibold mb-2">Inputs:</h4>
                    <ul className="text-sm text-gray-700 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(entry.formData).map(([key, value]) => (
                            <li key={key}><strong>{key}:</strong> {String(value)}</li>
                        ))}
                    </ul>
                     <h4 className="font-semibold mt-4 mb-2">Summary:</h4>
                     <p className="text-sm text-gray-700">{entry.result.summary}</p>
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
