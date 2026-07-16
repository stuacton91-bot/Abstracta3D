import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Sparkles, Users } from 'lucide-react';

const Lobby: React.FC = () => {
  const [joinCode, setJoinCode] = useState('');
  const setRoomId = useAppStore(state => state.setRoomId);

  const handleCreate = () => {
    // Generate random 4-letter code
    const code = Array.from({length: 4}, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
    setRoomId(code);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.length === 4) {
      setRoomId(joinCode.toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full grid md:grid-cols-2 gap-8">
        
        {/* Create Room */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
          
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400">
            <Sparkles size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Host Session</h2>
          <p className="text-neutral-400 text-sm mb-8">Create a new canvas and share the code to collaborate.</p>
          
          <button 
            onClick={handleCreate}
            className="mt-auto w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl transition-colors"
          >
            Create New Session
          </button>
        </div>

        {/* Join Room */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden group hover:border-pink-500/50 transition-colors">
          <div className="absolute top-0 left-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
          
          <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-6 text-pink-400">
            <Users size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Join Session</h2>
          <p className="text-neutral-400 text-sm mb-8">Enter a 4-letter code to connect to an existing canvas.</p>
          
          <form onSubmit={handleJoin} className="mt-auto w-full space-y-4">
            <input 
              type="text" 
              maxLength={4}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABCD"
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-pink-500 rounded-xl px-4 py-4 text-center text-2xl tracking-widest font-mono text-white placeholder-neutral-700 outline-none uppercase transition-colors"
            />
            <button 
              type="submit"
              disabled={joinCode.length !== 4}
              className="w-full bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 text-white font-semibold py-4 rounded-xl transition-colors"
            >
              Join Session
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Lobby;
