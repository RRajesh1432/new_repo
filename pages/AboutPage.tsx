import React from 'react';

const Card: React.FC<{title: string; children: React.ReactNode; className?: string}> = ({ title, children, className = "" }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg border border-gray-200 ${className}`}>
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        {children}
    </div>
);

const AboutPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">About AgriYield-AI</h1>
                <p className="mt-2 text-lg text-gray-600">Intelligent Farming for a Sustainable Future</p>
            </div>

            <Card title="Our Mission">
                <p className="text-gray-600">
                    AgriYield-AI is a powerful tool designed to empower farmers with data-driven insights. By leveraging the advanced capabilities of Govt , we provide precise crop yield predictions, identify potential risks, and offer actionable recommendations to optimize farm productivity and sustainability.
                </p>
            </Card>

            <Card title="Key Features">
                <ul className="list-disc list-inside space-y-3 text-gray-600">
                    <li>
                        <strong>AI-Powered Predictions:</strong> Enter your farm's data—including crop type, soil conditions, and weather patterns—to receive highly accurate yield forecasts.
                    </li>
                    <li>
                        <strong>Actionable Recommendations:</strong> Get customized advice on fertilizer use, irrigation schedules, and pest control to maximize your harvest and minimize waste.
                    </li>
                    <li>
                        <strong>Risk Analysis:</strong> Our AI analyzes your inputs to identify potential risks like adverse weather, helping you prepare and mitigate potential losses.
                    </li>
                    <li>
                        <strong>Crop Explorer:</strong> Access a comprehensive database of crop information, including ideal growing conditions and common pests, to make informed planting decisions.
                    </li>
                    <li>
                        <strong>History & Analytics:</strong> Track your past predictions and analyze trends over time with our easy-to-use dashboard, helping you refine your strategies season after season.
                    </li>
                </ul>
            </Card>
            
            <Card title="Technology Stack">
                <p className="text-gray-600">
                    This application is built using a modern frontend stack including React, TypeScript, and Tailwind CSS. The core predictive power comes from the <span className="font-semibold text-green-700">Google Gemini API</span>, which processes your data to generate structured, intelligent insights. All data is stored locally in your browser, ensuring your privacy.
                </p>
            </Card>
        </div>
    );
};

export default AboutPage;
