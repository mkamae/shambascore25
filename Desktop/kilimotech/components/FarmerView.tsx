import React, { useState } from 'react';
import { Farmer } from '../types';
import Card from './shared/Card';
import Sidebar from './shared/Sidebar';
import MobileMenuButton from './shared/MobileMenuButton';
import AIInsights from './AIInsights';
import FarmDataForm from './FarmDataForm';
import CreditSimulator from './CreditSimulator';
import InsuranceModule from './InsuranceModule';
import MpesaUpload from './MpesaUpload';
import FinancialPartners from './FinancialPartners';
import WeatherForecast from './WeatherForecast';
import FarmerProfile from './FarmerProfile';
import MpesaWallet from './MpesaWallet';

interface FarmerViewProps {
    farmer: Farmer;
    onLogout?: () => void;
}

const FarmerView: React.FC<FarmerViewProps> = ({ farmer, onLogout }) => {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [isEditingFarm, setIsEditingFarm] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar Navigation */}
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onLogout={onLogout}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
                {/* Top Bar (Mobile Header) */}
                <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <MobileMenuButton 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            isOpen={sidebarOpen}
                        />
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">KilimoTech</h2>
                            <p className="text-xs text-gray-500">{farmer.name}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {/* Desktop Welcome Section */}
                    <div className="hidden lg:block mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">Welcome, {farmer.name}!</h2>
                        <p className="text-md text-gray-500">Your personalized farm assistant.</p>
                    </div>

                    {/* Mobile Welcome Section */}
                    <div className="lg:hidden mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Welcome back!</h2>
                        <p className="text-sm text-gray-500">Select a section from the menu above.</p>
                    </div>

                    {/* Dashboard Content */}
                    {activeTab === 'Dashboard' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <AIInsights farmer={farmer} />
                                </div>
                                <div className="space-y-6">
                                    <CreditSimulator creditProfile={farmer.creditProfile} />
                                    <InsuranceModule insurance={farmer.insurance} />
                                </div>
                            </div>
                            <WeatherForecast farmer={farmer} />
                        </div>
                    )}

                    {/* My Farm Content */}
                    {activeTab === 'My Farm' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card title="Current Farm Data">
                                <ul className="space-y-2 text-sm">
                                    <li><strong>Crop Type:</strong> {farmer.farmData.cropType}</li>
                                    <li><strong>Acreage:</strong> {farmer.farmData.acreage} acres</li>
                                    <li><strong>Yield Estimate:</strong> {farmer.farmData.yieldEstimate} tons/acre</li>
                                    <li><strong>Annual Expenses:</strong> KES {farmer.farmData.annualExpenses.toLocaleString()}</li>
                                    <li><strong>Rainfall:</strong> {farmer.farmData.rainfall}</li>
                                    <li><strong>Soil Health:</strong> {farmer.farmData.soilHealth}</li>
                                </ul>
                                <button 
                                    onClick={() => setIsEditingFarm(!isEditingFarm)} 
                                    className="mt-4 w-full px-4 py-2 text-sm font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                                >
                                    {isEditingFarm ? 'Cancel' : 'Edit Farm Data'}
                                </button>
                            </Card>
                            {isEditingFarm && (
                                <Card title="Edit Farm Details">
                                    <FarmDataForm farmer={farmer} onSave={() => setIsEditingFarm(false)} />
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Financials Content */}
                    {activeTab === 'Financials' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <CreditSimulator creditProfile={farmer.creditProfile} />
                                <InsuranceModule insurance={farmer.insurance} />
                            </div>
                            <div className="space-y-6">
                                <MpesaUpload farmer={farmer} />
                                <FinancialPartners />
                            </div>
                        </div>
                    )}

                    {/* Wallet Content */}
                    {activeTab === 'Wallet' && (
                        <MpesaWallet farmer={farmer} />
                    )}

                    {/* Profile Content */}
                    {activeTab === 'Profile' && (
                        <FarmerProfile farmer={farmer} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default FarmerView;
