import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Provider } from '../types';
import { IconEdit, IconStar } from '../components/Icons';

const ProviderDashboard: React.FC = () => {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Provider>>({});

  useEffect(() => {
    const p = db.getCurrentProvider();
    setProvider(p);
    if (p) {
        setFormData(p);
    }
  }, []);

  const handleSave = () => {
      if (provider && formData) {
          const updated = { ...provider, ...formData } as Provider;
          db.updateProvider(updated);
          setProvider(updated);
          setIsEditing(false);
          alert("Profile Updated Successfully!");
      }
  };

  if (!provider) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Welcome, {provider.name}</h1>
                    <p className="text-slate-500">{provider.type === 'HOSPITAL' ? 'Hospital / Clinic' : 'Pharmacy'}</p>
                </div>
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 font-medium transition"
                    >
                        <IconEdit className="w-4 h-4" /> Edit Profile
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="text-purple-800 font-semibold mb-1">Average Rating</div>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-slate-900">{provider.rating.toFixed(1)}</span>
                        <IconStar className="w-6 h-6 text-yellow-400" fill />
                    </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="text-blue-800 font-semibold mb-1">Total Reviews</div>
                    <div className="text-3xl font-bold text-slate-900">{provider.reviews.length}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="text-green-800 font-semibold mb-1">Status</div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-lg font-bold text-slate-900">Active</span>
                    </div>
                </div>
            </div>

            {/* Edit Form or Display View */}
            {isEditing ? (
                <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-4">Edit Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Facility Name</label>
                            <input 
                                className="w-full p-2 border rounded"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Phone Number</label>
                            <input 
                                className="w-full p-2 border rounded"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                         <label className="block text-sm font-semibold mb-1">Address</label>
                         <input 
                                className="w-full p-2 border rounded"
                                value={formData.location?.address}
                                onChange={e => setFormData({...formData, location: { ...formData.location!, address: e.target.value }})}
                        />
                    </div>
                    
                    <div>
                         <label className="block text-sm font-semibold mb-1">Services (comma separated)</label>
                         <input 
                                className="w-full p-2 border rounded"
                                value={formData.services?.join(', ')}
                                onChange={e => setFormData({...formData, services: e.target.value.split(',').map(s => s.trim())})}
                        />
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button 
                            onClick={handleSave} 
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                        <button 
                            onClick={() => setIsEditing(false)} 
                            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 mb-3 border-b pb-1">Contact Info</h3>
                        <div className="space-y-2 text-slate-600">
                            <p><span className="font-medium text-slate-900">Phone:</span> {provider.phone}</p>
                            <p><span className="font-medium text-slate-900">Address:</span> {provider.location.address}</p>
                            <p><span className="font-medium text-slate-900">Email:</span> {provider.email}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 mb-3 border-b pb-1">Services Offered</h3>
                        <div className="flex flex-wrap gap-2">
                            {provider.services.map(s => (
                                <span key={s} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium border border-slate-200">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Patient Reviews</h3>
            <div className="space-y-4">
                {provider.reviews.map(r => (
                    <div key={r.id} className="border-b border-gray-100 last:border-0 pb-4">
                        <div className="flex justify-between mb-2">
                             <div className="font-bold text-slate-800">{r.userName}</div>
                             <div className="text-sm text-gray-500">{r.date}</div>
                        </div>
                        <div className="flex items-center mb-2">
                             {[...Array(5)].map((_, i) => (
                                <IconStar key={i} className={`w-4 h-4 ${i < r.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill={i < r.rating} />
                             ))}
                        </div>
                        <p className="text-slate-600">"{r.comment}"</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default ProviderDashboard;