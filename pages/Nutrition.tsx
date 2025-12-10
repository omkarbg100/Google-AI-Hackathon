import React, { useState } from 'react';
import { geminiService } from '../services/gemini';
import { db } from '../services/db';

const Nutrition: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setData(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await geminiService.analyzeNutrition(file);
      setData(res);
      
      db.saveNutrition({
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        foodItem: res.foodName,
        calories: res.calories,
        macros: JSON.stringify(res.macros),
        recipe: res.recipe
      });
    } catch (err) {
      alert("Could not analyze food. Ensure API key is set.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-green-700 mb-2">Nutrition AI</h2>
        <p className="text-gray-500 mb-6">Snap a picture of your meal to get macros and healthy recipes.</p>

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50">
           {preview ? (
             <img src={preview} alt="Food" className="h-64 object-contain rounded-lg shadow-sm" />
           ) : (
             <div className="text-center text-gray-400">
               <span className="text-4xl">📸</span>
               <p className="mt-2 text-sm">Tap to upload food image</p>
             </div>
           )}
           <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="mt-4"
            />
        </div>

        <button 
            onClick={handleAnalyze}
            disabled={!file || loading}
            className={`w-full mt-6 py-3 rounded-lg font-bold text-white transition ${
              !file || loading ? 'bg-gray-300' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Analyzing Nutrients...' : 'Get Nutrition Facts'}
        </button>
      </div>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-green-500">
             <h3 className="text-xl font-bold mb-4">{data.foodName}</h3>
             <div className="flex justify-between items-center mb-6">
               <div className="text-center">
                 <div className="text-2xl font-bold text-green-600">{data.calories}</div>
                 <div className="text-xs text-gray-500 uppercase">Calories</div>
               </div>
               <div className="text-center">
                 <div className="text-xl font-semibold text-blue-600">{data.healthScore}/10</div>
                 <div className="text-xs text-gray-500 uppercase">Health Score</div>
               </div>
             </div>

             <div className="space-y-2">
               <div className="flex justify-between p-2 bg-gray-50 rounded">
                 <span>Protein</span>
                 <span className="font-bold">{data.macros.protein}</span>
               </div>
               <div className="flex justify-between p-2 bg-gray-50 rounded">
                 <span>Carbs</span>
                 <span className="font-bold">{data.macros.carbs}</span>
               </div>
               <div className="flex justify-between p-2 bg-gray-50 rounded">
                 <span>Fats</span>
                 <span className="font-bold">{data.macros.fats}</span>
               </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-orange-400">
            <h3 className="text-xl font-bold mb-3">Healthy Twist Recipe</h3>
            <p className="text-gray-700 italic">"{data.recipe}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nutrition;