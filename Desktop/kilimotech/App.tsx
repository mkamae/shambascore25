import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import FarmerView from './components/FarmerView';
import LandingPage from './components/LandingPage';
import Header from './components/shared/Header';
import Chatbot from './components/Chatbot';
import { FEATURES } from './config/features.js';

const AppContent: React.FC = () => {
    const { userType, logout, selectedFarmer } = useApp();

    if (!userType) {
        return <LandingPage />;
    }

    return (
        <div className="min-h-screen bg-green-50/50">
            {/* Header only shown on desktop - mobile uses sidebar top bar */}
            <div className="hidden lg:block">
                <Header onLogout={logout} farmerName={selectedFarmer?.name} />
            </div>
            <main className="lg:pt-0">
                {selectedFarmer && <FarmerView farmer={selectedFarmer} onLogout={logout} />}
            </main>
            {/* AI Chatbot - feature-flagged */}
            {userType === 'farmer' && FEATURES.aiAdvisory && <Chatbot />}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;
