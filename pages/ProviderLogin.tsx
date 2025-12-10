import React, { useState } from 'react';
import { db } from '../services/db';
import { ModuleType } from '../types';

interface ProviderLoginProps {
  onLoginSuccess: () => void;
  onNavigate: (module: ModuleType) => void;
}

const ProviderLogin: React.FC<ProviderLoginProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const provider = db.loginProvider(email, password);
    if (provider) {
      onLoginSuccess();
    } else {
      setError('Invalid provider credentials.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100 relative overflow-hidden">
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Provider Portal</h2>
          <p className="text-slate-500 mt-2">Manage your clinic or pharmacy profile</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Business Email</label>
            <input
              type="email"
              required
              placeholder="e.g. clinic@health.com"
              className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition shadow-lg"
          >
            Access Dashboard
          </button>
        </form>

        <div className="mt-8 text-center text-sm border-t border-slate-100 pt-6">
          <p className="text-slate-500">
            Not registered yet?{' '}
            <button 
              onClick={() => onNavigate(ModuleType.PROVIDER_REGISTER)} 
              className="text-purple-600 font-bold hover:underline"
            >
              Register Facility
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderLogin;