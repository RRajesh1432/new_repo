import React, { useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { PredictionResult, Recommendation, RiskFactor, WeatherImpact } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';

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
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3">
                 {item.potentialYieldIncrease && (
                    <p className="text-sm font-medium text-green-600">+ {item.potentialYieldIncrease}% Potential Yield</p>
                )}
                {item.fertilizerType && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Suggested Fertilizer:</span>
                        <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">{item.fertilizerType}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// Custom tooltip for the yield bar chart
const CustomBarTooltip: React.FC<any> = ({ active, payload, label, confidenceScore, yieldUnit }) => {
    const { t } = useContext(LanguageContext)!;
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800">{`${label}: ${payload[0].value.toFixed(2)} ${yieldUnit}`}</p>
          <p className="text-sm text-gray-600">{`${t('resultsDisplay.confidence')}: ${(confidenceScore * 100).toFixed(0)}%`}</p>
        </div>
      );
    }
    return null;
  };

// New enhanced visualization for a single risk factor using a segmented bar graph
const RiskItem: React.FC<{ risk: RiskFactor, isHighlighted?: boolean }> = ({ risk, isHighlighted = false }) => {
    const severityStyles = {
        'High': { color: 'red-500', text: 'text-red-600' },
        'Medium': { color: 'yellow-500', text: 'text-yellow-600' },
        'Low': { color: 'blue-500', text: 'text-blue-600' },
    };

    const currentStyle = severityStyles[risk.severity];
    // A more impactful highlight for the specific added risk
    const highlightClass = isHighlighted ? `bg-red-100 border-l-4 border-red-500` : `bg-gray-50`;

    return (
        <div className={`flex items-center justify-between p-3 rounded-md ${highlightClass}`}>
            <p className={`text-sm font-medium flex-1 pr-4 ${isHighlighted ? 'text-red-900 font-bold' : 'text-gray-800'}`}>{risk.risk}</p>
            <div className="flex items-center gap-3 flex-shrink-0">
                {/* The segmented graph */}
                <div className="flex w-20 space-x-1" title={`Severity: ${risk.severity}`}>
                    <div className={`h-2 flex-1 rounded-full ${risk.severity === 'Low' || risk.severity === 'Medium' || risk.severity === 'High' ? `bg-${currentStyle.color}` : 'bg-gray-200'}`}></div>
                    <div className={`h-2 flex-1 rounded-full ${risk.severity === 'Medium' || risk.severity === 'High' ? `bg-${currentStyle.color}` : 'bg-gray-200'}`}></div>
                    <div className={`h-2 flex-1 rounded-full ${risk.severity === 'High' ? `bg-${currentStyle.color}` : 'bg-gray-200'}`}></div>
                </div>
                <span className={`text-sm font-semibold w-12 text-right ${currentStyle.text}`}>{risk.severity}</span>
            </div>
        </div>
    );
};


// New component to list all risk factors with the new visualization
const RiskList: React.FC<{ risks: RiskFactor[], highlightIdentifier?: string }> = ({ risks, highlightIdentifier }) => {
    if (risks.length === 0) {
        return <p className="text-sm text-gray-500 italic px-3 pt-2">No significant risks identified in this scenario.</p>;
    }
    
    const sortedRisks = [...risks].sort((a, b) => {
        const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
    });

    return (
        <div className="space-y-2">
            {sortedRisks.map((risk, index) => (
                <RiskItem key={index} risk={risk} isHighlighted={highlightIdentifier ? risk.risk === highlightIdentifier : false} />
            ))}
        </div>
    );
};

const WeatherImpactCard: React.FC<{ analysis: WeatherImpact }> = ({ analysis }) => {
    const { t } = useContext(LanguageContext)!;
    const { overallImpact, temperatureEffect, rainfallEffect, keyWeatherRisks } = analysis;

    const impactDetails = {
        Positive: {
            bgColor: 'bg-green-100',
            borderColor: 'border-green-500',
            textColor: 'text-green-800',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 18.468V6a2 2 0 012-2h2.5" /></svg>,
            label: t('resultsDisplay.positive')
        },
        Neutral: {
            bgColor: 'bg-yellow-100',
            borderColor: 'border-yellow-500',
            textColor: 'text-yellow-800',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>,
            label: t('resultsDisplay.neutral')
        },
        Negative: {
            bgColor: 'bg-red-100',
            borderColor: 'border-red-500',
            textColor: 'text-red-800',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.738 3h4.017c.163 0 .326.02.485.06L17 5.532V18a2 2 0 01-2 2h-2.5" /></svg>,
            label: t('resultsDisplay.negative')
        }
    };

    const details = impactDetails[overallImpact] || impactDetails.Neutral;

    return (
        <Card title={t('resultsDisplay.weatherImpact')}>
            <div className="space-y-6">
                <div className={`p-4 rounded-lg border-l-4 ${details.bgColor} ${details.borderColor}`}>
                    <h4 className="font-semibold text-gray-700">{t('resultsDisplay.overallImpact')}</h4>
                    <div className={`flex items-center gap-3 mt-1 ${details.textColor}`}>
                        {details.icon}
                        <span className="text-2xl font-bold">{details.label}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800">{t('resultsDisplay.temperatureEffect')}</h5>
                            <p className="text-sm text-gray-600">{temperatureEffect}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2h-4.28a2 2 0 01-1.79-.88L8 4" /></svg>
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800">{t('resultsDisplay.rainfallEffect')}</h5>
                            <p className="text-sm text-gray-600">{rainfallEffect}</p>
                        </div>
                    </div>
                </div>

                {keyWeatherRisks && keyWeatherRisks.length > 0 && (
                    <div>
                        <h5 className="font-semibold text-gray-800 mb-2">{t('resultsDisplay.keyWeatherRisks')}</h5>
                        <ul className="space-y-2">
                            {keyWeatherRisks.map((risk, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-yellow-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.273-1.21 2.91 0l5.396 10.297c.63 1.203-.28 2.604-1.66 2.604H4.52c-1.38 0-2.29-1.401-1.66-2.604l5.396-10.297zM9 13a1 1 0 112 0 1 1 0 01-2 0zm1-5a1 1 0 00-1 1v2a1 1 0 002 0V9a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    <span>{risk}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </Card>
    );
};


const ResultsDisplay: React.FC<{ result: PredictionResult }> = ({ result }) => {
    const { t } = useContext(LanguageContext)!;

    const yieldData = [
        { name: t('resultsDisplay.withPesticides'), value: result.predictedYieldWithPesticides },
        { name: t('resultsDisplay.withoutPesticides'), value: result.predictedYieldWithoutPesticides },
    ];
    
    const pestRiskIdentifier = "High risk of pest infestation";
    const risksWithPesticides = result.riskFactors.filter(r => r.risk !== pestRiskIdentifier);
    const risksWithoutPesticides = result.riskFactors; // All risks

    // Calculate yield difference for clearer comparison
    const yieldDifference = result.predictedYieldWithPesticides - result.predictedYieldWithoutPesticides;
    const yieldPercentageDifference = result.predictedYieldWithPesticides > 0 ? (yieldDifference / result.predictedYieldWithPesticides) * 100 : 0;

    return (
        <div className="mt-8 space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card title={t('resultsDisplay.summary')} className="lg:col-span-2">
                    <p className="text-gray-600">{result.summary}</p>
                    <div className="mt-6 flex items-baseline justify-around">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-500">{t('resultsDisplay.withPesticides')}</p>
                            <p className="text-5xl font-extrabold text-green-600">{result.predictedYieldWithPesticides.toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-500">{t('resultsDisplay.withoutPesticides')}</p>
                            <p className="text-5xl font-extrabold text-yellow-600">{result.predictedYieldWithoutPesticides.toFixed(2)}</p>
                        </div>
                    </div>
                    <p className="text-center text-xl font-medium text-gray-500 mt-2">{result.yieldUnit}</p>
                    <div className="mt-4">
                        <p className="text-sm text-gray-500 text-center">{t('resultsDisplay.confidence')}: <span className="font-bold text-gray-700">{(result.confidenceScore * 100).toFixed(0)}%</span></p>
                    </div>
                </Card>
                <Card title={t('resultsDisplay.comparison')}>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={yieldData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                                cursor={{fill: 'rgba(16, 185, 129, 0.1)'}}
                                content={<CustomBarTooltip yieldUnit={result.yieldUnit} confidenceScore={result.confidenceScore} />}
                            />
                            <Bar dataKey="value" barSize={50}>
                               <Cell fill="#10B981" />
                               <Cell fill="#F59E0B" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            
             <Card title={t('resultsDisplay.scenarioComparison')}>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {/* With Pesticides */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                         <div className="flex items-center gap-4 p-4 bg-green-600 text-white">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5.026l.01.01.004.002.002.001l.002.001L2.2 5.03l.003.002.002.001.002.001a11.955 11.955 0 0115.592 0l.002-.001.002-.001.003-.002.005-.002.01-.01.01-.01A11.954 11.954 0 0110 1.944zM10 4.345a9.564 9.564 0 017.028 3.516l.01.01.003.002.002.001l.002.001L17.07 7.9l.002.002.002.001.002.001a9.565 9.565 0 01-14.14 0l.002-.001.002-.001.002-.002.003-.002.01-.01.01-.01a9.564 9.564 0 017.028-3.516zM10 18a.75.75 0 01.75-.75h.008a.75.75 0 010 1.5H10.75A.75.75 0 0110 18zm-2.25-2.25a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" clipRule="evenodd" /></svg>
                             <div>
                                <h5 className="text-xl font-bold">{t('resultsDisplay.withPesticides')}</h5>
                                <p className="text-3xl font-bold">{result.predictedYieldWithPesticides.toFixed(2)} <span className="text-lg font-normal opacity-90">{result.yieldUnit}</span></p>
                             </div>
                        </div>
                        <div className="p-4 space-y-3">
                           <h6 className="font-semibold text-gray-700">{t('resultsDisplay.riskFactors')}:</h6>
                           <RiskList risks={risksWithPesticides} />
                        </div>
                    </div>

                    {/* Without Pesticides */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                         <div className="flex items-center gap-4 p-4 bg-yellow-500 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M9.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0V12zM10 15.25a.75.75 0 00-.75.75v.01a.75.75 0 001.5 0v-.01a.75.75 0 00-.75-.75z" /><path fillRule="evenodd" d="M15.312 3.264a.75.75 0 01.752 1.29l-1.42 2.458a6.25 6.25 0 11-8.288 8.288l-2.458 1.42a.75.75 0 01-1.29-.752l1.17-4.32a.75.75 0 01.752-1.29l4.32-1.17a.75.75 0 011.29.752L9.4 12.01l.933-.27a4.75 4.75 0 105.978-5.978l.27-.933 1.73-1.565z" clipRule="evenodd" /></svg>
                             <div>
                                <h5 className="text-xl font-bold">{t('resultsDisplay.withoutPesticides')}</h5>
                                <p className="text-3xl font-bold">{result.predictedYieldWithoutPesticides.toFixed(2)} <span className="text-lg font-normal opacity-90">{result.yieldUnit}</span></p>
                                {yieldDifference > 0 && (
                                    <p className="text-sm font-medium text-red-100 bg-red-800/50 px-2 py-1 rounded-md mt-1 inline-block">
                                        - {yieldDifference.toFixed(2)} {result.yieldUnit} ({yieldPercentageDifference.toFixed(0)}% {t('resultsDisplay.reduction')})
                                    </p>
                                )}
                             </div>
                        </div>
                        <div className="p-4 space-y-3">
                            <h6 className="font-semibold text-gray-700">{t('resultsDisplay.riskFactors')}:</h6>
                             <RiskList risks={risksWithoutPesticides} highlightIdentifier={pestRiskIdentifier} />
                        </div>
                    </div>
                </div>
            </Card>

            <WeatherImpactCard analysis={result.weatherImpactAnalysis} />

            <Card title={t('resultsDisplay.recommendations')}>
                <div className="space-y-4">
                    {result.recommendations.map((rec, index) => (
                        <RecommendationCard key={index} item={rec} />
                    ))}
                </div>
            </Card>

        </div>
    );
};

export default ResultsDisplay;