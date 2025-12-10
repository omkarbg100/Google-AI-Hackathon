import React, { useState } from 'react';
import { db } from '../services/db';
import MapComponent from '../components/Map';
import { IconStar } from '../components/Icons';
import { Provider } from '../types';

interface EmergencyProps {
  onStartTrip: (provider: Provider) => void;
}

const Emergency: React.FC<EmergencyProps> = ({ onStartTrip }) => {
  const hospitals = db.getProviders('HOSPITAL');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  const toggleProvider = (p: Provider) => {
      if (selectedProvider?.id === p.id) {
          setSelectedProvider(null);
      } else {
          setSelectedProvider(p);
      }
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-600 text-white p-6 rounded-2xl shadow-lg animate-pulse">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-extrabold uppercase">Emergency</h2>
                <p className="opacity-90">Quick access to Ambulance & Hospitals</p>
            </div>
            <span className="text-5xl">🚨</span>
        </div>
        <div className="mt-6 flex gap-4">
            <a href="tel:911" className="flex-1 bg-white text-red-600 py-3 rounded-lg font-bold text-center text-lg shadow hover:bg-gray-100">
                Call Ambulance
            </a>
            <button className="flex-1 border-2 border-white text-white py-3 rounded-lg font-bold hover:bg-red-700">
                SOS Alert
            </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Nearest Hospitals</h3>
        <MapComponent providers={hospitals} userLocation={null} />
        
        <div className="mt-6 grid gap-4">
            {hospitals.map(h => (
                <div key={h.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white">
                    <div className="flex justify-between items-start cursor-pointer" onClick={() => toggleProvider(h)}>
                        <div className="flex-grow">
                            <h4 className="font-bold text-lg text-slate-900">{h.name}</h4>
                            <p className="text-gray-500">{h.location.address}</p>
                            
                            {/* Star Rating */}
                            <div className="flex items-center gap-1 mt-1">
                                <span className="font-bold text-sm text-slate-700">{h.rating.toFixed(1)}</span>
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <IconStar 
                                            key={star} 
                                            className="w-4 h-4 text-yellow-400" 
                                            fill={star <= Math.round(h.rating)} 
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-gray-400 ml-1">({h.reviews.length} reviews)</span>
                            </div>

                            <div className="flex gap-2 mt-2">
                                 {h.services.map(s => <span key={s} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded font-medium">{s}</span>)}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                             <a href={`tel:${h.phone}`} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold text-center shadow hover:bg-red-700">Call</a>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onStartTrip(h); }}
                                className="text-blue-600 text-sm underline text-center font-bold"
                            >
                                Route
                            </button>
                        </div>
                    </div>
                    
                    {/* Expanded Details */}
                    {selectedProvider?.id === h.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                            <h5 className="font-semibold text-gray-800 mb-2">Patient Reviews</h5>
                            {h.reviews.length > 0 ? (
                                <div className="space-y-3">
                                    {h.reviews.map(r => (
                                        <div key={r.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                                            <div className="flex justify-between mb-1">
                                                <span className="font-bold text-slate-700">{r.userName}</span>
                                                <span className="text-xs text-gray-400">{r.date}</span>
                                            </div>
                                            <div className="flex mb-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <IconStar key={i} className={`w-3 h-3 ${i < r.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill={i < r.rating} />
                                                ))}
                                            </div>
                                            <p className="text-slate-600 italic">"{r.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No reviews yet.</p>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Emergency;