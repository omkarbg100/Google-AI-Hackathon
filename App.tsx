import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Diagnosis from './pages/Diagnosis';
import Pharmacy from './pages/Pharmacy';
import Emergency from './pages/Emergency';
import Registration from './pages/Registration'; // Provider Registration
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import UserProfile from './pages/UserProfile';
import ProviderLogin from './pages/ProviderLogin';
import ProviderDashboard from './pages/ProviderDashboard';
import TripView from './components/TripView';

import { ModuleType, User, Provider } from './types';
import { db } from './services/db';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType | 'HOME'>('HOME');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProvider, setCurrentProvider] = useState<Provider | null>(null);
  
  // Trip State
  const [tripProvider, setTripProvider] = useState<Provider | null>(null);

  useEffect(() => {
    // Check for existing session on load
    const user = db.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    const provider = db.getCurrentProvider();
    if (provider) {
        setCurrentProvider(provider);
        setActiveModule(ModuleType.PROVIDER_DASHBOARD);
    }
  }, []);

  const handleNavigate = (module: ModuleType | 'HOME') => {
    // Public Routes that don't require auth
    const publicModules: (ModuleType | 'HOME')[] = [
      'HOME',
      ModuleType.USER_LOGIN,
      ModuleType.USER_REGISTER,
      ModuleType.PROVIDER_LOGIN,
      ModuleType.PROVIDER_REGISTER
    ];

    if (publicModules.includes(module)) {
      setActiveModule(module);
      return;
    }

    // Protected Routes Check
    if (!currentUser && !currentProvider) {
      // Redirect to login if not authenticated
      setActiveModule(ModuleType.USER_LOGIN);
      return;
    }

    setActiveModule(module);
  };

  const handleUserLoginSuccess = () => {
    const user = db.getCurrentUser();
    setCurrentUser(user);
    setActiveModule('HOME');
  };

  const handleProviderLoginSuccess = () => {
      const provider = db.getCurrentProvider();
      setCurrentProvider(provider);
      setActiveModule(ModuleType.PROVIDER_DASHBOARD);
  };

  const handleLogout = () => {
    if (currentUser) {
        db.logoutUser();
        setCurrentUser(null);
    }
    if (currentProvider) {
        db.logoutProvider();
        setCurrentProvider(null);
    }
    setActiveModule('HOME');
  };

  const handleStartTrip = (provider: Provider) => {
      setTripProvider(provider);
      setActiveModule(ModuleType.TRIP);
  };

  const handleTripComplete = () => {
      setTripProvider(null);
      setActiveModule('HOME');
  };

  const renderContent = () => {
    switch (activeModule) {
      case ModuleType.TRIP:
        return tripProvider ? (
            <TripView 
                provider={tripProvider} 
                currentUser={currentUser} 
                onComplete={handleTripComplete} 
            />
        ) : <Home onNavigate={handleNavigate} currentUser={currentUser} />;

      case ModuleType.DIAGNOSIS:
        return <Diagnosis onStartTrip={handleStartTrip} />;
      case ModuleType.PHARMACY:
        return <Pharmacy onStartTrip={handleStartTrip} />;
      case ModuleType.EMERGENCY:
        return <Emergency onStartTrip={handleStartTrip} />;
      
      // User Auth
      case ModuleType.USER_LOGIN:
        return <UserLogin onLoginSuccess={handleUserLoginSuccess} onNavigate={handleNavigate} />;
      case ModuleType.USER_REGISTER:
        return <UserRegister onRegisterSuccess={handleUserLoginSuccess} onNavigate={handleNavigate} />;
      case ModuleType.USER_PROFILE:
        return currentUser ? <UserProfile onLogout={handleLogout} /> : <UserLogin onLoginSuccess={handleUserLoginSuccess} onNavigate={handleNavigate} />;

      // Provider Pages
      case ModuleType.PROVIDER_REGISTER:
        return <Registration />;
      case ModuleType.PROVIDER_LOGIN:
        return <ProviderLogin onLoginSuccess={handleProviderLoginSuccess} onNavigate={handleNavigate} />;
      case ModuleType.PROVIDER_DASHBOARD:
        return currentProvider ? <ProviderDashboard /> : <ProviderLogin onLoginSuccess={handleProviderLoginSuccess} onNavigate={handleNavigate} />;
        
      default:
        return <Home onNavigate={handleNavigate} currentUser={currentUser} />;
    }
  };

  return (
    <Layout 
      activeModule={activeModule} 
      onNavigate={handleNavigate} 
      currentUser={currentUser}
      currentProvider={currentProvider}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;