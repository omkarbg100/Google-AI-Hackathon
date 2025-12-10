import React, { useState } from 'react';
import { ModuleType, User, Provider } from '../types';
import { IconHome, IconStethoscope, IconPill, IconSiren, IconUser, IconLogOut, IconActivity, IconEdit } from './Icons';

interface LayoutProps {
  children: React.ReactNode;
  activeModule: ModuleType | 'HOME';
  onNavigate: (module: ModuleType | 'HOME') => void;
  currentUser: User | null;
  currentProvider: Provider | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeModule, onNavigate, currentUser, currentProvider, onLogout }) => {
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Different navigation based on role
  let navItems;
  
  if (currentProvider) {
    navItems = [
        { id: ModuleType.PROVIDER_DASHBOARD, label: 'Dashboard', icon: <IconHome className="w-6 h-6" /> },
        { id: ModuleType.EMERGENCY, label: 'Live Map', icon: <IconSiren className="w-6 h-6" /> },
    ];
  } else {
    navItems = [
        { id: 'HOME', label: 'Home', icon: <IconHome className="w-6 h-6" /> },
        { id: ModuleType.DIAGNOSIS, label: 'Diagnosis', icon: <IconStethoscope className="w-6 h-6" /> },
        { id: ModuleType.PHARMACY, label: 'Pharmacy', icon: <IconPill className="w-6 h-6" /> },
        { id: ModuleType.EMERGENCY, label: 'Emergency', icon: <IconSiren className="w-6 h-6" /> },
    ];
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F6F9] text-slate-900 font-sans">
      
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 h-16 fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-6 shadow-sm">
        <div className="flex items-center gap-3 pl-12 md:pl-0"> 
          <div className={`p-1.5 rounded-lg text-white ${currentProvider ? 'bg-purple-600' : 'bg-blue-600'}`}>
            <IconActivity className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
              {currentProvider ? 'Provider Portal' : 'AI Doctor'}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {currentUser || currentProvider ? (
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => currentUser && onNavigate(ModuleType.USER_PROFILE)}
                  className={`flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 ${currentUser ? 'hover:bg-slate-200 cursor-pointer transition' : ''}`}
                >
                  {currentUser?.photo ? (
                    <img src={currentUser.photo} alt="Profile" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <IconUser className="w-4 h-4 text-slate-500" />
                  )}
                  <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                      {currentUser?.name || currentProvider?.name}
                  </span>
                </button>
             </div>
          ) : (
              <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onNavigate(ModuleType.USER_LOGIN)}
                    className="text-sm bg-slate-900 text-white hover:bg-slate-800 font-medium px-5 py-2 rounded-lg transition shadow-sm"
                  >
                    User Login
                  </button>
              </div>
          )}
          
          {!currentProvider && !currentUser && (
            <button 
                onClick={() => onNavigate(ModuleType.PROVIDER_LOGIN)}
                className="hidden md:block text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition"
            >
                For Providers
            </button>
          )}
        </div>
      </header>

      {/* Desktop Hover Sidebar */}
      <aside 
        className={`hidden md:flex fixed left-0 top-16 bottom-0 z-50 flex-col bg-white border-r border-slate-200 shadow-xl transition-all duration-300 ease-in-out ${
          isSidebarHovered ? 'w-64' : 'w-16'
        }`}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div className="flex flex-col py-6 space-y-2">
           {navItems.map((item) => {
             const isActive = activeModule === item.id;
             return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                className={`flex items-center px-4 py-3 mx-2 rounded-xl transition-all duration-200 group overflow-hidden whitespace-nowrap ${
                  isActive 
                    ? (currentProvider ? 'bg-purple-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md')
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'}`}>
                    {item.icon}
                </span>
                <span className={`ml-4 font-medium text-sm transition-opacity duration-200 ${
                  isSidebarHovered ? 'opacity-100' : 'opacity-0 w-0'
                }`}>
                  {item.label}
                </span>
              </button>
             );
           })}
        </div>

        {/* Bottom Section of Sidebar */}
        <div className={`mt-auto p-4 border-t border-slate-100 transition-opacity duration-300 ${isSidebarHovered ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-xs text-slate-400 text-center">© 2025 AI Doctor</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-grow pt-24 pb-20 px-4 md:px-8 transition-all duration-300 mx-auto w-full max-w-7xl md:ml-16`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 z-50 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
           const isActive = activeModule === item.id;
           return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive ? (currentProvider ? 'text-purple-600' : 'text-blue-600') : 'text-slate-400'
              }`}
            >
              <span className={isActive ? 'scale-110 transition-transform' : ''}>
                {React.cloneElement(item.icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
              </span>
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </button>
           );
        })}
      </nav>
    </div>
  );
};

export default Layout;