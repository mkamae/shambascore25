import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import FarmerView from './components/FarmerView';
import LandingPage from './components/LandingPage';
import Header from './components/shared/Header';

const AppContent: React.FC = () => {
    const { userType, logout, selectedFarmer } = useApp();

    if (!userType) {
        return <LandingPage />;
    }

    return (
        <div className="min-h-screen bg-green-50/50">
            <Header onLogout={logout} farmerName={selectedFarmer?.name} />
            <main className="p-4 sm:p-6 lg:p-8">
                {selectedFarmer && <FarmerView farmer={selectedFarmer} />}
            </main>
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
