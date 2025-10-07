import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200">
      <div className="container mx-auto px-4 lg:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="w-2 h-4 bg-gray-200 rounded-sm animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Agentic Commerce Protocol
            </h1>
        </div>
        <p className="hidden md:block text-sm text-gray-500">Your AI-Powered Apple Store.</p>
      </div>
    </header>
  );
};

export default Header;
