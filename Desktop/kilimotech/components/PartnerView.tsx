import React from 'react';
import { Farmer } from '../types';
import Card from './shared/Card';

interface PartnerViewProps {
    farmers: Farmer[];
    selectedFarmer: Farmer | null;
    selectFarmer: (farmerId: string) => void;
}

const DocumentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);


const FarmerProfile: React.FC<{ farmer: Farmer }> = ({ farmer }) => (
    <Card title={`Profile: ${farmer.name}`} className="h-full">
        <div className="space-y-4">
            <div>
                <h4 className="font-bold text-gray-700">Contact Details</h4>
                <p className="text-sm">Phone: {farmer.phone}</p>
                <p className="text-sm">Location: {farmer.location}</p>
            </div>
            <div>
                <h4 className="font-bold text-gray-700">Farm Data</h4>
                 <ul className="space-y-1 text-sm list-disc list-inside">
                    <li><strong>Type:</strong> {farmer.farmType}</li>
                    <li><strong>Crop:</strong> {farmer.farmData.cropType}</li>
                    <li><strong>Acreage:</strong> {farmer.farmData.acreage} acres</li>
                    <li><strong>Yield Estimate:</strong> {farmer.farmData.yieldEstimate} tons/acre</li>
                 </ul>
            </div>
            <div>
                <h4 className="font-bold text-gray-700">Financial Profile</h4>
                 <ul className="space-y-1 text-sm list-disc list-inside">
                    <li><strong>Credit Limit:</strong> KES {farmer.creditProfile.loanEligibility.toLocaleString()}</li>
                    <li><strong>Repayment Score:</strong> {farmer.creditProfile.repaymentAbilityScore}%</li>
                    <li><strong>Risk Score:</strong> {farmer.creditProfile.riskScore} (Low Risk)</li>
                 </ul>
            </div>
             <div>
                <h4 className="font-bold text-gray-700">Insurance</h4>
                <p className="text-sm">Status: {farmer.insurance.status}</p>
            </div>
             {farmer.mpesaStatement && (
                <div>
                     <h4 className="font-bold text-gray-700">Uploaded Documents</h4>
                     <div className="flex items-center text-sm p-2 bg-gray-100 rounded-md">
                        <DocumentIcon className="w-5 h-5 mr-2 text-gray-500" />
                        <span>{farmer.mpesaStatement.fileName}</span>
                     </div>
                </div>
            )}
        </div>
    </Card>
);

const PartnerView: React.FC<PartnerViewProps> = ({ farmers, selectedFarmer, selectFarmer }) => {
    return (
        <div>
             <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Partner Dashboard</h2>
                <p className="text-md text-gray-500">Monitor farmer profiles and risk assessments.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                     <Card title="All Farmers">
                        <ul className="space-y-2">
                            {farmers.map(farmer => (
                                <li key={farmer.id}>
                                    <button
                                        onClick={() => selectFarmer(farmer.id)}
                                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md ${selectedFarmer?.id === farmer.id ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-100 hover:bg-green-100'}`}
                                    >
                                        <p className="font-semibold">{farmer.name}</p>
                                        <p className={`text-xs ${selectedFarmer?.id === farmer.id ? 'text-green-100' : 'text-gray-600'}`}>{farmer.location}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
                <div className="md:col-span-2">
                    {selectedFarmer ? (
                        <FarmerProfile farmer={selectedFarmer} />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-white rounded-xl shadow-lg p-8">
                            <p className="text-gray-500 text-lg">Select a farmer from the list to view their details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PartnerView;