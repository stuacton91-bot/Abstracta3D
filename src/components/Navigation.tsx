import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Palette, LayoutDashboard, Copy, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const Navigation: React.FC = () => {
  const roomId = useAppStore(state => state.roomId);
  const [copied, setCopied] = useState(false);

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Session ID</span>
          <span className="text-sm text-neutral-300 font-mono">{roomId}</span>
        </div>
        <button 
          onClick={copyRoomId}
          className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-3 py-1.5 rounded-md transition-colors text-sm font-mono text-white"
          title="Copy Session ID"
        >
          {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} className="text-neutral-400" />}
          <span className="sm:hidden">{roomId}</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
