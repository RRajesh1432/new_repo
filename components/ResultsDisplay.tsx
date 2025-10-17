

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { PredictionResult, Recommendation, RiskFactor } from '../types';

const Card: React.FC<{title: string; children: React.ReactNode; className?: string}> = ({ title, children, className = "" }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg border border-gray-200 ${className}`}>
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        {children}
    </div>
);

const RecommendationCard: React.FC<{ item: Recommendation }> = ({ item }) => {
    const impactColor = {
        'High': 'bg-red-100 text-red-800',
        'Medium': 'bg-yellow-100 text-yellow-800',
        'Low': 'bg-green-100 text-green-800',
    }[item.impact];

    return (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${impactColor}`}>{item.impact} Impact</span>
            </div>
            <p className="text-gray-600 mt-2 text-sm">{item.description}</p>
            {item.potentialYieldIncrease && (
                <p className="text-sm font-medium text-green-600 mt-2">+ {item.potentialYieldIncrease}% Potential Yield</p>
            )}
        </div>
    );
};

// Custom tooltip for the yield bar chart
const CustomBarTooltip: React.FC<any> = ({ active, payload, label, yieldUnit, confidenceScore }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800">{`Predicted Yield: ${payload[0].value.toFixed(2)} ${yieldUnit}`}</p>
          <p className="text-sm text-gray-600">{`Confidence: ${(confidenceScore * 100).toFixed(0)}%`}</p>
        </div>
      );
    }
    return null;
  };

const getSeverityStyles = (severity: RiskFactor['severity']): { badge: string; text: string; hex: string } => {
    switch (severity) {
        case 'High':
            return { badge: 'bg-red-100 text-red-800', text: 'text-red-600', hex: '#EF4444' };
        case 'Medium':
            return { badge: 'bg-yellow-100 text-yellow-800', text: 'text-yellow-600', hex: '#F59E0B' };
        case 'Low':
        default:
            return { badge: 'bg-blue-100 text-blue-800', text: 'text-blue-600', hex: '#3B82F6' };
    }
};


const ResultsDisplay: React.FC<{ result: PredictionResult }> = ({ result }) => {
    const yieldData = [{ name: 'Predicted Yield', value: result.predictedYield }];
    
    const riskData = result.riskFactors
        .map(rf => ({
            ...rf,
            severityValue: rf.severity === 'High' ? 3 : rf.severity === 'Medium' ? 2 : 1,
        }))
        .sort((a, b) => b.severityValue - a.severityValue);

    return (
        <div className="mt-8 space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card title="Prediction Summary" className="lg:col-span-2">
                    <p className="text-gray-600">{result.summary}</p>
                    <div className="mt-6 flex items-baseline space-x-4">
                        <p className="text-5xl font-extrabold text-green-600">{result.predictedYield.toFixed(2)}</p>
                        <span className="text-xl font-medium text-gray-500">{result.yieldUnit}</span>
                    </div>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">Confidence Score: <span className="font-bold text-gray-700">{(result.confidenceScore * 100).toFixed(0)}%</span></p>
                    </div>
                </Card>
                <Card title="Yield Potential">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={yieldData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                                cursor={{fill: 'rgba(16, 185, 129, 0.1)'}}
                                content={<CustomBarTooltip yieldUnit={result.yieldUnit} confidenceScore={result.confidenceScore} />}
                            />
                            <Bar dataKey="value" fill="#10B981" barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <Card title="Key Risk Factors">
                 {riskData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <ul className="space-y-3">
                            {riskData.map((item, index) => {
                                const styles = getSeverityStyles(item.severity);
                                return (
                                     <li key={index} className="flex items-center justify-between">
                                        <span className="text-gray-700">{item.risk}</span>
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${styles.badge}`}>{item.severity}</span>
                                    </li>
                                )
                            })}
                        </ul>
                        <ResponsiveContainer width="100%" height={riskData.length * 40 + 20}>
                            <BarChart
                                data={riskData}
                                layout="vertical"
                                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="risk" hide />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="p-2 bg-white border rounded shadow-lg">
                                                <p className="text-sm">{`${data.risk}: `}<span className={`font-bold ${getSeverityStyles(data.severity).text}`}>{data.severity}</span></p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }} />
                                <Bar dataKey="severityValue" barSize={20}>
                                    {riskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getSeverityStyles(entry.severity).hex} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                 ) : (
                    <p className="text-gray-500">No significant risk factors identified.</p>
                 )}
            </Card>

            <Card title="Actionable Recommendations">
                <div className="space-y-4">
                    {result.recommendations.map((rec, index) => (
                        <RecommendationCard key={index} item={rec} />
                    ))}
                </div>
            </Card>

            <Card title="Weather Impact Analysis">
                <p className="text-gray-600">{result.weatherImpactAnalysis}</p>
            </Card>

        </div>
    );
};

export default ResultsDisplay;