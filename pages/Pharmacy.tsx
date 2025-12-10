import React, { useState } from 'react';
import { db } from '../services/db';
import MapComponent from '../components/Map';
import { geminiService } from '../services/gemini';
import { Provider } from '../types';
import { IconStar } from '../components/Icons';

interface PharmacyProps {
    onStartTrip: (provider: Provider) => void;
}

const Pharmacy: React.FC<PharmacyProps> = ({ onStartTrip }) => {
  const [symptoms, setSymptoms] = useState('');
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  const pharmacies = db.getProviders('PHARMACY');

  const handleRecommend = async () => {
    if (!symptoms) return;
    setLoading(true);
    try {
      const rec = await geminiService.recommendMedicine(symptoms);
      setRecommendation(rec);
    } catch (e) {
      alert("Error getting recommendation.");
    } finally {
      setLoading(false);
    }
  };

  const toggleProvider = (p: Provider) => {
    if (selectedProvider?.id === p.id) {
        setSelectedProvider(null);
    } else {
        setSelectedProvider(p);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-50">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">Pharmacy & Meds</h2>
        
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            placeholder="Describe what you feel (e.g. headache, cold)" 
            className="flex-grow p-3 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
          <button 
            onClick={handleRecommend}
            disabled={loading}
            className="bg-purple-600 text-white px-6 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 shadow-md"
          >
            {loading ? '...' : 'Ask AI'}
          </button>
        </div>

        {recommendation && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 mb-6">
            <h4 className="font-bold text-purple-800 mb-2">Recommended OTC Meds:</h4>
            <p className="text-gray-700 whitespace-pre-line">{recommendation}</p>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-xl font-bold mb-4">Nearby Pharmacies</h3>
        <MapComponent providers={pharmacies} userLocation={null} />
        
        <div className="mt-4 space-y-4">
          {pharmacies.map(p => (
            <div key={p.id} className="border-b border-gray-100 last:border-0 pb-4">
               <div className="flex justify-between items-start cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition" onClick={() => toggleProvider(p)}>
                  <div>
                    <div className="font-bold text-gray-800">{p.name}</div>
                    <div className="text-sm text-gray-500">{p.location.address}</div>
                    
                     {/* Star Rating */}
                    <div className="flex items-center gap-1 mt-1">
                        <span className="font-bold text-sm text-slate-700">{p.rating.toFixed(1)}</span>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <IconStar 
                                    key={star} 
                                    className="w-3 h-3 text-yellow-400" 
                                    fill={star <= Math.round(p.rating)} 
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-400 ml-1">({p.reviews.length})</span>
                    </div>

                    <div className="text-xs text-green-600 mt-2 font-medium">{p.services.join(' • ')}</div>
                  </div>
                  <a href={`tel:${p.phone}`} className="bg-gray-100 p-2 rounded-full text-purple-600 hover:bg-purple-100">
                    📞
                  </a>
               </div>

                {/* Expanded Details */}
                {selectedProvider?.id === p.id && (
                    <div className="mt-3 px-2 pt-2 border-t border-gray-100 animate-fade-in">
                        <h5 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-2">Customer Reviews</h5>
                        {p.reviews.length > 0 ? (
                            <div className="space-y-2">
                                {p.reviews.map(r => (
                                    <div key={r.id} className="bg-slate-50 p-2 rounded text-sm">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-slate-700 text-xs">{r.userName}</span>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <IconStar key={i} className={`w-2 h-2 ${i < r.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill={i < r.rating} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-slate-600 text-xs mt-1">"{r.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 italic">No reviews yet.</p>
                        )}
                         <button 
                            onClick={(e) => { e.stopPropagation(); onStartTrip(p); }}
                            className="w-full bg-blue-600 text-white text-xs font-bold py-2 rounded mt-3 hover:bg-blue-700"
                        >
                            Navigate to Pharmacy
                        </button>
                    </div>
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pharmacy;