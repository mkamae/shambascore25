import React, { useState } from 'react';
import { Farmer } from '../types';
import Card from './shared/Card';
import Tabs from './shared/Tabs';
import AIInsights from './AIInsights';
import FarmDataForm from './FarmDataForm';
import CreditSimulator from './CreditSimulator';
import InsuranceModule from './InsuranceModule';
import MpesaUpload from './MpesaUpload';
import FinancialPartners from './FinancialPartners';
import WeatherForecast from './WeatherForecast';

interface FarmerViewProps {
    farmer: Farmer;
}

const FarmerView: React.FC<FarmerViewProps> = ({ farmer }) => {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [isEditingFarm, setIsEditingFarm] = useState(false);

    const tabs = ['Dashboard', 'My Farm', 'Financials'];

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Welcome, {farmer.name}!</h2>
                <p className="text-md text-gray-500">Your personalized farm assistant.</p>
            </div>
            
            <div className="mb-6">
                <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

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
                         <button onClick={() => setIsEditingFarm(!isEditingFarm)} className="mt-4 w-full px-4 py-2 text-sm font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200">
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
        </div>
    );
};

export default FarmerView;