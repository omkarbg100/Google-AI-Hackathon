import React, { useState } from 'react';
import { db } from '../services/db';
import { ModuleType, User } from '../types';

interface UserRegisterProps {
  onRegisterSuccess: () => void;
  onNavigate: (module: ModuleType) => void;
}

const UserRegister: React.FC<UserRegisterProps> = ({ onRegisterSuccess, onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'Other'
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      type: 'USER',
      name: formData.name,
      email: formData.email,
      password: formData.password,
      age: formData.age,
      gender: formData.gender
    };

    const success = db.registerUser(newUser);
    if (success) {
      onRegisterSuccess();
    } else {
      setError("Email already registered. Please login.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 text-sm">Join AI Doctor for personalized health insights</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500">
            Already have an account?{' '}
            <button 
              onClick={() => onNavigate(ModuleType.USER_LOGIN)} 
              className="text-blue-600 font-bold hover:underline"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;