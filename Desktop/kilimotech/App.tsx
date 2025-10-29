
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import FarmerView from './components/FarmerView';
import PartnerView from './components/PartnerView';
import Login from './components/Login';
import Header from './components/shared/Header';

const AppContent: React.FC = () => {
    const { userType, logout, farmers, selectedFarmer, selectFarmer } = useApp();

    if (!userType) {
        return <Login />;
    }

    return (
        <div className="min-h-screen bg-green-50/50">
            <Header userType={userType} onLogout={logout} />
            <main className="p-4 sm:p-6 lg:p-8">
                {userType === 'farmer' && <FarmerView farmer={selectedFarmer!} />}
                {userType === 'partner' && <PartnerView farmers={farmers} selectFarmer={selectFarmer} selectedFarmer={selectedFarmer} />}
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
