import React, { useState } from 'react';
import { geminiService } from '../services/gemini';
import { db } from '../services/db';
import { DiagnosisResult, Provider } from '../types';
import MapComponent from '../components/Map';

interface DiagnosisProps {
    onStartTrip: (provider: Provider) => void;
}

const Diagnosis: React.FC<DiagnosisProps> = ({ onStartTrip }) => {
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Fetch both Hospitals and Doctors for diagnosis support
  const specialists = [
    ...db.getProviders('HOSPITAL'),
    ...db.getProviders('DOCTOR')
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file && !info.trim()) {
        alert("Please provide either a symptom description or upload an image/video.");
        return;
    }

    setLoading(true);
    try {
      const analysis = await geminiService.diagnoseDisease(file, info);
      setResult(analysis);
      
      // Get current user to link history
      const currentUser = db.getCurrentUser();

      // Save to history (mock)
      const newRecord: DiagnosisResult = {
        id: Date.now().toString(),
        userId: currentUser?.id, // Link to user
        date: new Date().toLocaleDateString(),
        symptoms: info,
        aiAnalysis: analysis || '',
        image: preview || undefined
      };
      db.saveDiagnosis(newRecord);

    } catch (err) {
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Diagnosis</h2>
        <p className="text-gray-500 mb-6">Describe your symptoms or upload a photo/video for AI analysis.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Describe Symptoms (Required if no image)</label>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
              placeholder="E.g., Itching since 2 days, mild fever..."
              value={info}
              onChange={(e) => setInfo(e.target.value)}
            />
          </div>

          <label className="block">
            <span className="text-gray-700 font-medium">Upload Media (Optional)</span>
            <span className="text-gray-400 text-sm ml-2">- Image, Audio, or Video</span>
            <input 
              type="file" 
              accept="image/*,video/*,audio/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
              "
            />
          </label>

          {preview && (
            <div className="mt-4 relative inline-block">
               <img src={preview} alt="Preview" className="h-48 rounded-lg object-cover border" />
               <button 
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
               >
                 ✕
               </button>
            </div>
          )}

          <button 
            onClick={handleAnalyze}
            disabled={(!file && !info.trim()) || loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition shadow-lg ${
              (!file && !info.trim()) || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Analyzing with Gemini 3 Pro...' : 'Analyze Symptoms'}
          </button>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Analysis Result</h3>
            <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-line">
              {result}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Nearby Specialists & Hospitals</h3>
            <MapComponent providers={specialists} userLocation={null} />
            
            {/* List of nearby specialists */}
            <div className="mt-6 space-y-4">
              {specialists.slice(0, 3).map(p => (
                 <div key={p.id} className="border border-gray-100 p-4 rounded-lg flex justify-between items-center hover:bg-gray-50 transition">
                    <div>
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-500 uppercase font-semibold">{p.type === 'DOCTOR' ? 'Specialist' : 'Hospital'}</div>
                        <div className="text-sm text-gray-600 mt-1">{p.services.join(', ')}</div>
                    </div>
                    <button 
                      onClick={() => onStartTrip(p)} 
                      className="text-blue-600 text-sm font-bold underline"
                    >
                      Directions
                    </button>
                 </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnosis;