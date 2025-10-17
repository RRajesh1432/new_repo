

import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getHistory } from '../services/historyService';
import type { HistoryEntry } from '../types';

const AnalyticsPage: React.FC = () => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    const analyticsData = useMemo(() => {
        if (history.length === 0) return { avgYieldByCrop: [] };

        const cropData: { [key: string]: { totalYield: number; count: number; totalArea: number } } = {};

        history.forEach(entry => {
            const crop = entry.formData.cropType;
            if (!cropData[crop]) {
                cropData[crop] = { totalYield: 0, count: 0, totalArea: 0 };
            }
            // Use the higher potential yield for analytics
            cropData[crop].totalYield += entry.result.predictedYieldWithPesticides * entry.formData.area;
            cropData[crop].totalArea += entry.formData.area;
            cropData[crop].count++;
        });

        const avgYieldByCrop = Object.entries(cropData).map(([name, data]) => ({
            name,
            avgYield: data.totalYield / data.totalArea,
        }));
        
        return { avgYieldByCrop };

    }, [history]);
    
    if (history.length === 0) {
        return (
            <div className="text-center py-12 px-6 bg-white rounded-lg shadow-md border max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
                <h2 className="text-xl font-semibold text-gray-700">Not Enough Data</h2>
                <p className="mt-2 text-gray-500">Generate some predictions to see your analytics.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center">Analytics Dashboard</h1>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Average Yield by Crop (tons/hectare)</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={analyticsData.avgYieldByCrop}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${(value as number).toFixed(2)} tons/ha`} />
                        <Legend />
                        <Bar dataKey="avgYield" fill="#22C55E" name="Average Yield" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AnalyticsPage;