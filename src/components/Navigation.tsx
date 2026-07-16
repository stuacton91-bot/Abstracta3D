import React from 'react';
import { NavLink } from 'react-router-dom';
import { Palette, LayoutDashboard } from 'lucide-react';

const Navigation: React.FC = () => {
  return (
    <nav className="h-14 bg-neutral-950 border-b border-neutral-800 flex items-center px-4 md:px-8 justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <h1 className="text-white font-bold text-lg tracking-wide hidden sm:block">Abstracta</h1>
      </div>
      
      <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
        <NavLink
          to="/forge"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`
          }
        >
          <Palette size={16} />
          <span className="hidden sm:inline">Shape Forge</span>
        </NavLink>
        <NavLink
          to="/studio"
          className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`
          }
        >
          <LayoutDashboard size={16} />
          <span className="hidden sm:inline">Canvas Studio</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
