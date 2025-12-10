import React, { useState } from 'react';
import { db } from '../services/db';
import { ModuleType } from '../types';

interface UserLoginProps {
  onLoginSuccess: () => void;
  onNavigate: (module: ModuleType) => void;
}

const UserLogin: React.FC<UserLoginProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = db.loginUser(email, password);
    if (user) {
      onLoginSuccess();
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 text-sm">Login to access your health history</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500">
            Don't have an account?{' '}
            <button 
              onClick={() => onNavigate(ModuleType.USER_REGISTER)} 
              className="text-blue-600 font-bold hover:underline"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;