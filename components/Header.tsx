
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/70 backdrop-blur-md sticky top-0 z-10 border-b border-slate-700">
      <div className="container mx-auto px-4 lg:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-slate-900 rounded-sm animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
            Agentic Commerce Protocol
            </h1>
        </div>
        <p className="hidden md:block text-sm text-slate-400">The Future of Shopping is Conversational.</p>
      </div>
    </header>
  );
};

export default Header;
