
import React, { useState } from 'react';
import { Farmer } from '../types';
import { useApp } from '../context/AppContext';
import { getFarmInsights } from '../services/geminiService';
import Card from './shared/Card';
import Spinner from './shared/Spinner';

interface AIInsightsProps {
    farmer: Farmer;
}

const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-1.125a6.01 6.01 0 001.125-1.5 6.01 6.01 0 00-1.125-1.5A6.01 6.01 0 0012 8.25m-2.25 0a6.01 6.01 0 011.125-1.5A6.01 6.01 0 0112 5.25a6.01 6.01 0 011.5 1.125 6.01 6.01 0 011.125 1.5m-3.75 0h3.75m-3.75 0a6.01 6.01 0 00-1.5 1.125 6.01 6.01 0 00-1.125 1.5 6.01 6.01 0 001.125 1.5 6.01 6.01 0 001.5 1.125M12 18v-5.25m0 0a6.01 6.01 0 001.5-1.125a6.01 6.01 0 001.125-1.5 6.01 6.01 0 00-1.125-1.5A6.01 6.01 0 0012 8.25m-2.25 0a6.01 6.01 0 011.125-1.5A6.01 6.01 0 0112 5.25a6.01 6.01 0 011.5 1.125 6.01 6.01 0 011.125 1.5m-3.75 0h3.75" />
  </svg>
);


const AIInsights: React.FC<AIInsightsProps> = ({ farmer }) => {
    const { updateFarmerInsights } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetchInsights = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const insights = await getFarmInsights(farmer);
            updateFarmerInsights(farmer.id, insights);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="AI-Powered Insights" icon={<LightbulbIcon className="w-6 h-6" />}>
            {isLoading && <Spinner />}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            {!isLoading && !farmer.insights && (
                <div className="text-center">
                    <p className="mb-4">Get personalized advice to boost your farm's productivity and financial health.</p>
                    <button onClick={handleFetchInsights} className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">
                        Generate My Insights
                    </button>
                </div>
            )}
            
            {farmer.insights && !isLoading && (
                 <div className="space-y-4">
                    <div>
                        <h4 className="font-bold text-green-700">Improving Your Yield</h4>
                        <p className="text-sm whitespace-pre-line">{farmer.insights.yieldAdvice}</p>
                    </div>
                     <div>
                        <h4 className="font-bold text-yellow-700">Managing Financial Risks</h4>
                        <p className="text-sm whitespace-pre-line">{farmer.insights.riskAdvice}</p>
                    </div>
                     <div>
                        <h4 className="font-bold text-blue-700">Boosting Loan Eligibility</h4>
                        <p className="text-sm whitespace-pre-line">{farmer.insights.loanAdvice}</p>
                    </div>
                    <button onClick={handleFetchInsights} className="mt-4 w-full px-4 py-2 text-sm font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200">
                        Refresh Insights
                    </button>
                 </div>
            )}
        </Card>
    );
};

export default AIInsights;
