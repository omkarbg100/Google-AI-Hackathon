import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { User, DiagnosisResult } from '../types';
import { IconEdit, IconUser, IconStethoscope, IconLogOut } from '../components/Icons';

interface UserProfileProps {
  onLogout?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [history, setHistory] = useState<DiagnosisResult[]>([]);

  useEffect(() => {
    const u = db.getCurrentUser();
    if (u) {
        setUser(u);
        setFormData(u);
        if (u.photo) setPreview(u.photo);
        
        // Fetch Diagnosis History
        const userHistory = db.getDiagnosisHistory(u.id);
        setHistory(userHistory);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        setFormData(prev => ({ ...prev, photo: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (user && formData) {
        const updated = { ...user, ...formData } as User;
        db.updateUser(updated);
        setUser(updated);
        setIsEditing(false);
        alert("Profile Updated Successfully!");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
        {/* Profile Details Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 font-medium transition text-sm shadow-md"
                    >
                        <IconEdit className="w-4 h-4" /> Edit Profile
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Photo */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner relative bg-slate-50 flex items-center justify-center">
                        {preview ? (
                            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <IconUser className="w-20 h-20 text-slate-300" />
                        )}
                        
                        {isEditing && (
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition cursor-pointer">
                                <label className="cursor-pointer text-white text-xs font-bold bg-black bg-opacity-50 px-2 py-1 rounded">
                                    Change
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                        )}
                    </div>
                    {isEditing && !preview && (
                         <label className="text-sm text-blue-600 font-bold cursor-pointer">
                            Upload Photo
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                         </label>
                    )}
                </div>

                {/* Right Column: Info Form */}
                <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                            {isEditing ? (
                                <input 
                                    className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            ) : (
                                <div className="text-lg font-medium text-slate-900 p-2">{user.name}</div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                             <div className="text-lg font-medium text-slate-900 p-2 truncate" title={user.email}>{user.email}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
                            {isEditing ? (
                                <input 
                                    type="number"
                                    className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={formData.age || ''}
                                    onChange={e => setFormData({...formData, age: e.target.value})}
                                />
                            ) : (
                                <div className="text-lg font-medium text-slate-900 p-2">{user.age || 'N/A'}</div>
                            )}
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                             {isEditing ? (
                                <select
                                    className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={formData.gender || 'Other'}
                                    onChange={e => setFormData({...formData, gender: e.target.value})}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            ) : (
                                <div className="text-lg font-medium text-slate-900 p-2">{user.gender || 'N/A'}</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Home Address</label>
                        {isEditing ? (
                            <textarea
                                className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                rows={2}
                                value={formData.address || ''}
                                onChange={e => setFormData({...formData, address: e.target.value})}
                                placeholder="Enter your full address"
                            />
                        ) : (
                            <div className="text-lg font-medium text-slate-900 p-2">{user.address || 'No address set'}</div>
                        )}
                    </div>

                    {isEditing && (
                        <div className="flex gap-4 mt-6">
                            <button 
                                onClick={handleSave} 
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md transition"
                            >
                                Save Changes
                            </button>
                            <button 
                                onClick={() => { setIsEditing(false); setFormData(user); setPreview(user.photo || null); }} 
                                className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Diagnosis History Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <IconStethoscope className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Diagnosis History</h2>
             </div>

             {history.length > 0 ? (
                <div className="space-y-4">
                    {history.map((record) => (
                        <div key={record.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition bg-gray-50">
                            <div className="flex flex-col md:flex-row gap-4">
                                {record.image && (
                                    <div className="flex-shrink-0">
                                        <img src={record.image} alt="Symptom" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                                    </div>
                                )}
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{record.date}</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="text-xs font-semibold text-gray-500 uppercase">Symptoms:</span>
                                        <p className="text-slate-800 text-sm">{record.symptoms}</p>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                         <span className="text-xs font-semibold text-blue-600 uppercase">AI Analysis:</span>
                                         <div className="text-slate-700 text-sm mt-1 line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                                            {record.aiAnalysis}
                                         </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             ) : (
                <div className="text-center py-8 text-slate-400">
                    <p>No diagnosis history found.</p>
                </div>
             )}
        </div>

        {/* Logout Button */}
        {onLogout && (
            <div className="flex justify-center pt-4">
                <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-8 py-3 rounded-xl font-bold transition w-full md:w-auto justify-center"
                >
                    <IconLogOut className="w-5 h-5" />
                    Log Out
                </button>
            </div>
        )}
    </div>
  );
};

export default UserProfile;