import React from 'react';
import type { Page } from '../types';

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


const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <header className="bg-green-800 shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-white text-xl font-bold">🌾 AgriYield-AI</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink page="predict" currentPage={currentPage} setCurrentPage={setCurrentPage}>Predict</NavLink>
              <NavLink page="history" currentPage={currentPage} setCurrentPage={setCurrentPage}>History</NavLink>
              <NavLink page="analytics" currentPage={currentPage} setCurrentPage={setCurrentPage}>Analytics</NavLink>
              <NavLink page="explorer" currentPage={currentPage} setCurrentPage={setCurrentPage}>Crop Explorer</NavLink>
              <NavLink page="about" currentPage={currentPage} setCurrentPage={setCurrentPage}>About</NavLink>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;