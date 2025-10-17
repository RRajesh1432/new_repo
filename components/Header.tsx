import React, { useContext, useState, useRef, useEffect } from 'react';
import type { Page } from '../types';
import { LanguageContext, Locale } from '../contexts/LanguageContext';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavLink: React.FC<{
    page: Page;
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    children: React.ReactNode;
}> = ({ page, currentPage, setCurrentPage, children }) => {
    const isActive = currentPage === page;
    const activeClasses = 'bg-green-700 text-white';
    const inactiveClasses = 'text-gray-300 hover:bg-green-600 hover:text-white';
    return (
        <button
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
        >
            {children}
        </button>
    );
};

const LanguageSwitcher: React.FC = () => {
    const { locale, setLocale } = useContext(LanguageContext)!;
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages: { code: Locale; name: string }[] = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'te', name: 'తెలుగు' },
        { code: 'ta', name: 'தமிழ்' },
        { code: 'kn', name: 'ಕನ್ನಡ' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' },
        { code: 'pt', name: 'Português' },
        { code: 'bn', name: 'বাংলা' },
    ];

    const currentLanguage = languages.find(lang => lang.code === locale);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-32 px-3 py-2 bg-green-900/50 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-800 focus:ring-white"
            >
                <span>{currentLanguage?.name}</span>
                 <svg className={`w-4 h-4 ml-2 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-20">
                    <ul className="py-1">
                        {languages.map(lang => (
                             <li key={lang.code}>
                                <button
                                    onClick={() => {
                                        setLocale(lang.code);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm ${locale === lang.code ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    {lang.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
  const { t } = useContext(LanguageContext)!;

  return (
    <header className="bg-green-800 shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-white text-xl font-bold">🌾 AgriYield-AI</span>
          </div>
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink page="predict" currentPage={currentPage} setCurrentPage={setCurrentPage}>{t('header.predict')}</NavLink>
                <NavLink page="history" currentPage={currentPage} setCurrentPage={setCurrentPage}>{t('header.history')}</NavLink>
                <NavLink page="explorer" currentPage={currentPage} setCurrentPage={setCurrentPage}>{t('header.explorer')}</NavLink>
                <NavLink page="about" currentPage={currentPage} setCurrentPage={setCurrentPage}>{t('header.about')}</NavLink>
              </div>
            </div>
            <div className="ml-6 flex items-center">
               <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;