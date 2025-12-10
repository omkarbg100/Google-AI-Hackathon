import React from 'react';
import { ModuleType, User } from '../types';
import { IconStethoscope, IconPill, IconSiren } from '../components/Icons';

interface HomeProps {
  onNavigate: (module: ModuleType) => void;
  currentUser?: User | null;
}

const Home: React.FC<HomeProps> = ({ onNavigate, currentUser }) => {
  const modules = [
    { 
        id: ModuleType.DIAGNOSIS, 
        title: 'AI Diagnosis', 
        desc: 'Identify skin conditions & symptoms instanty using advanced computer vision.',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        icon: <IconStethoscope className="w-8 h-8 text-blue-600" />,
        borderColor: 'border-blue-100'
    },
    { 
        id: ModuleType.PHARMACY, 
        title: 'Pharmacy Finder', 
        desc: 'Find specific medications and the nearest open pharmacies.',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        icon: <IconPill className="w-8 h-8 text-purple-600" />,
        borderColor: 'border-purple-100'
    },
    { 
        id: ModuleType.EMERGENCY, 
        title: 'Emergency Help', 
        desc: 'One-tap access to ambulances and nearest trauma centers.',
        bg: 'bg-red-50',
        text: 'text-red-700',
        icon: <IconSiren className="w-8 h-8 text-red-600" />,
        borderColor: 'border-red-100'
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in max-w-6xl mx-auto">
      
      {/* Hero Section */}
      <div className="text-center py-10 md:py-16">
        <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-wide mb-4">
            POWERED BY GEMINI 3 PRO
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          {currentUser ? `Welcome Back, ${currentUser.name}` : <>Your Personal AI <span className="text-blue-600">Health Companion</span></>}
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
          {currentUser 
            ? "Your health dashboard is ready. Choose a service below to get started." 
            : "Experience the future of healthcare. Instant diagnosis, pharmacy finder, and emergency response—all in one secure platform."
          }
        </p>
        
        {!currentUser && (
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
             <button 
               onClick={() => onNavigate(ModuleType.USER_REGISTER)}
               className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 hover:scale-105 transition transform"
             >
               Get Started Free
             </button>
             <button 
               onClick={() => onNavigate(ModuleType.USER_LOGIN)}
               className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold border border-slate-200 shadow-sm hover:bg-slate-50 transition"
             >
               Login to Account
             </button>
          </div>
        )}
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m) => (
            <div 
                key={m.id}
                onClick={() => onNavigate(m.id)}
                className={`group relative bg-white p-6 rounded-2xl border ${m.borderColor} shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden`}
            >
                <div className={`absolute top-0 right-0 w-24 h-24 ${m.bg} rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>
                
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${m.bg} group-hover:bg-white group-hover:shadow-md transition-colors duration-300`}>
                    {m.icon}
                </div>
                
                <h3 className="font-bold text-xl text-slate-900 mb-2">{m.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{m.desc}</p>
                
                <div className="mt-4 flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className={m.text}>Open Module</span>
                    <svg className={`w-4 h-4 ml-1 ${m.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
            </div>
        ))}
      </div>

      {/* Provider Call to Action - Only show if NO user is logged in */}
      {!currentUser && (
        <div className="mt-12 bg-slate-900 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl overflow-hidden relative">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>

           <div className="relative z-10 mb-6 md:mb-0 max-w-xl">
              <h3 className="text-3xl font-bold mb-3">Are you a Doctor or Pharmacist?</h3>
              <p className="text-slate-300 text-lg">Join our network to reach more patients. Register your clinic or pharmacy to appear on our real-time map.</p>
           </div>
           <button 
              onClick={() => onNavigate(ModuleType.PROVIDER_REGISTER)}
              className="relative z-10 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition transform hover:-translate-y-1"
          >
              Register Now
           </button>
        </div>
      )}
    </div>
  );
};

export default Home;