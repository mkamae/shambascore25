
import React, { useState } from 'react';
import { Insurance } from '../types';
import Card from './shared/Card';

interface InsuranceModuleProps {
    insurance: Insurance;
}

const InsuranceModule: React.FC<InsuranceModuleProps> = ({ insurance }) => {
    const [showClaimForm, setShowClaimForm] = useState(false);
    const [claimStatus, setClaimStatus] = useState('');

    const handleFileClaim = (e: React.FormEvent) => {
        e.preventDefault();
        setClaimStatus('Your claim for drought has been filed and is under review.');
        setShowClaimForm(false);
    }
    
    return (
        <Card title="Insurance">
            <div className="space-y-4">
                 <div>
                    <p className="text-sm font-medium text-gray-500">Current Status</p>
                    <p className={`text-lg font-bold ${insurance.status === 'Active' ? 'text-blue-600' : 'text-gray-500'}`}>{insurance.status}</p>
                </div>
                {claimStatus && <p className="text-sm p-2 bg-blue-100 text-blue-800 rounded-md">{claimStatus}</p>}
                
                {insurance.status === 'Active' && !showClaimForm && (
                     <button onClick={() => setShowClaimForm(true)} className="w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        File a Claim
                    </button>
                )}
                
                {showClaimForm && (
                    <form onSubmit={handleFileClaim} className="space-y-3 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold">New Claim</h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Reason for Claim</label>
                            <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option>Drought</option>
                                <option>Flood</option>
                                <option>Pest Infestation</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Submit Claim</button>
                        <button type="button" onClick={() => setShowClaimForm(false)} className="w-full mt-2 text-center text-sm text-gray-600">Cancel</button>
                    </form>
                )}
            </div>
        </Card>
    );
};

export default InsuranceModule;
