
import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

const Card: React.FC<{title: string; children: React.ReactNode; className?: string}> = ({ title, children, className = "" }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg border border-gray-200 ${className}`}>
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        {children}
    </div>
);

const AboutPage: React.FC = () => {
    const { t } = useContext(LanguageContext)!;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{t('aboutPage.title')}</h1>
                <p className="mt-2 text-lg text-gray-600">{t('aboutPage.subtitle')}</p>
            </div>

            <Card title={t('aboutPage.missionTitle')}>
                <p className="text-gray-600">
                    {t('aboutPage.missionText')}
                </p>
            </Card>

            <Card title={t('aboutPage.featuresTitle')}>
                <ul className="list-disc list-inside space-y-3 text-gray-600">
                    <li dangerouslySetInnerHTML={{ __html: t('aboutPage.feature1') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('aboutPage.feature2') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('aboutPage.feature3') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('aboutPage.feature4') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('aboutPage.feature5') }} />
                </ul>
            </Card>
            
            <Card title={t('aboutPage.techTitle')}>
                <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: t('aboutPage.techText') }} />
            </Card>
        </div>
    );
};

export default AboutPage;
