import React from 'react';
import { CreditProfile } from '../types';
import Card from './shared/Card';

interface CreditSimulatorProps {
    creditProfile: CreditProfile;
}

const CreditSimulator: React.FC<CreditSimulatorProps> = ({ creditProfile }) => {
    return (
        <Card title="Credit Simulation">
            <div className="space-y-3">
                <div>
                    <p className="text-sm font-medium text-gray-500">Loan Eligibility</p>
                    <p className="text-2xl font-bold text-green-600">KES {creditProfile.loanEligibility.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Repayment Score</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${creditProfile.repaymentAbilityScore}%` }}></div>
                    </div>
                    <p className="text-right text-sm font-semibold">{creditProfile.repaymentAbilityScore}%</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Risk Score (lower is better)</p>
                     <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${creditProfile.riskScore}%` }}></div>
                    </div>
                    <p className="text-right text-sm font-semibold">{creditProfile.riskScore}</p>
                </div>
                {creditProfile.summary && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                        <h4 className="text-sm font-bold text-gray-700">AI Analysis Summary</h4>
                        <p className="text-sm text-gray-600 italic">"{creditProfile.summary}"</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default CreditSimulator;