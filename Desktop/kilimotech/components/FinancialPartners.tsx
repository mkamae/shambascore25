
import React from 'react';
import Card from './shared/Card';

const partners = [
    { name: 'Equity Bank', service: 'Agricultural Loans' },
    { name: 'APA Insurance', service: 'Crop & Livestock Insurance' },
    { name: 'KCB Bank', service: 'Asset Financing' },
    { name: 'UAP Old Mutual', service: 'Farm Equipment Insurance'}
];

const FinancialPartners: React.FC = () => {
    return (
        <Card title="Connect with Financial Partners">
            <p className="text-sm text-gray-500 mb-4">
                Explore offers from our trusted partners for loans, insurance, and more.
            </p>
            <div className="space-y-4">
                {partners.map((partner, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                            <p className="font-semibold text-gray-800">{partner.name}</p>
                            <p className="text-xs text-gray-600">{partner.service}</p>
                        </div>
                        <button className="px-4 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-full hover:bg-green-700">
                            Learn More
                        </button>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default FinancialPartners;
