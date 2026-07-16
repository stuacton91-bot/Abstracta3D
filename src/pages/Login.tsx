import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'AbstractaProto') {
      localStorage.setItem('abstracta_auth', 'true');
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mb-4 border border-neutral-700 shadow-inner">
            <Lock className="text-blue-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Abstracta Vault</h1>
          <p className="text-neutral-400 text-sm mt-2">Prototype Access Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Master Password"
              className={`w-full bg-neutral-950 border ${error ? 'border-red-500' : 'border-neutral-800 focus:border-blue-500'} rounded-lg px-4 py-3 text-white placeholder-neutral-600 outline-none transition-colors`}
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
