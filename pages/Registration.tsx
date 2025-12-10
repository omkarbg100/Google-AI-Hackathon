import React, { useState } from 'react';
import { db } from '../services/db';
import { Provider } from '../types';

const Registration: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'HOSPITAL',
    phone: '',
    address: '',
    lat: '',
    lng: '',
    services: '',
    email: '',
    password: '',
    licenseNumber: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProvider: Provider = {
        id: Date.now().toString(),
        type: formData.type as 'HOSPITAL' | 'PHARMACY' | 'DOCTOR',
        name: formData.name,
        phone: formData.phone,
        location: {
            lat: parseFloat(formData.lat) || 37.77,
            lng: parseFloat(formData.lng) || -122.41,
            address: formData.address
        },
        services: formData.services.split(',').map(s => s.trim()),
        email: formData.email,
        password: formData.password,
        rating: 0, // Start with 0 rating
        reviews: [],
        licenseNumber: formData.type === 'DOCTOR' ? formData.licenseNumber : undefined
    };
    db.addProvider(newProvider);
    alert("Registration Successful! Please Login.");
    // Ideally redirect to Provider Login
  };

  const handleGeo = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p => {
            setFormData(prev => ({
                ...prev,
                lat: p.coords.latitude.toString(),
                lng: p.coords.longitude.toString()
            }));
        });
    }
  };

  const isDoctor = formData.type === 'DOCTOR';

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">
        {isDoctor ? 'Register as Doctor' : 'Register Medical Facility'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Provider Type</label>
            <select 
                className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
            >
                <option value="HOSPITAL">Hospital / Clinic</option>
                <option value="PHARMACY">Pharmacy</option>
                <option value="DOCTOR">Doctor / Specialist</option>
            </select>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
                {isDoctor ? 'Full Name (Dr.)' : 'Facility Name'}
            </label>
            <input 
                required
                className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder={isDoctor ? "Dr. John Doe" : "City General Hospital"}
            />
        </div>

        {isDoctor && (
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Medical License Number (Credentials)</label>
                <input 
                    required
                    className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.licenseNumber}
                    onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
                    placeholder="e.g. MED-12345-US"
                />
            </div>
        )}

        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email (for Login)</label>
                <input 
                    required
                    type="email"
                    className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <input 
                    required
                    type="password"
                    className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                />
            </div>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
            <input 
                required
                className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
            />
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
                {isDoctor ? 'Practice Address' : 'Facility Address'}
            </label>
            <input 
                required
                className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Latitude</label>
                <input 
                    className="w-full p-2 border rounded bg-gray-50"
                    value={formData.lat}
                    onChange={e => setFormData({...formData, lat: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Longitude</label>
                <input 
                    className="w-full p-2 border rounded bg-gray-50"
                    value={formData.lng}
                    onChange={e => setFormData({...formData, lng: e.target.value})}
                />
            </div>
        </div>
        <button type="button" onClick={handleGeo} className="text-sm text-blue-600 underline">Use Current Location</button>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
                {isDoctor ? 'Specialties (comma separated)' : 'Services (comma separated)'}
            </label>
            <input 
                placeholder={isDoctor ? "e.g. Dermatology, Pediatrics" : "e.g. Emergency, Cardiology, Home Delivery"}
                className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.services}
                onChange={e => setFormData({...formData, services: e.target.value})}
            />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
            {isDoctor ? 'Register as Doctor' : 'Register Facility'}
        </button>

      </form>
    </div>
  );
};

export default Registration;